import { Link } from "react-router-dom";
import React, { useState ,useEffect} from "react";
import axios from 'axios';

// Replace with real roommates from household API with backend
const ROOMMATES = [
  { id: "r1", name: "You" },
  { id: "r2", name: "Roommate 2" },
  { id: "r3", name: "Roommate 3" },
];

function Sidebar() {
  return (
    <div className="leftSide">
      <div className="sidebar">
        <center><ul>
          <li><Link to="/Roommates"><figure><img src={require('./images/roommates.png')} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
          <li className="active"><Link to="/Bills"><figure><img src={require('./images/bill.png')} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
          <li><Link to="/Calendar"><figure><img src={require('./images/calendar.png')} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
          <li><Link to="/Lists"><figure><img src={require('./images/list.png')} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
          <li><Link to="/Settings"><figure><img src={require('./images/settings.png')} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
        </ul></center>
      </div>
    </div>
  );
}


function Bills() {

  const householdId = localStorage.getItem("householdId") || "YOUR_HOUSEHOLD_ID_HERE";

  const [bills, setBills] = useState([]);

  const [selectedBillId, setSelectedBillId] = useState(null);
  const [activeRoommate, setActiveRoommate] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBillName, setNewBillName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const [editingTotal, setEditingTotal] = useState(false);
  const [editTotalValue, setEditTotalValue] = useState("");
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [editDueDateValue, setEditDueDateValue] = useState("");
  const [editingSplit, setEditingSplit] = useState(false);
  const [customSplits, setCustomSplits] = useState({});
  const [newComment, setNewComment] = useState("");

  const selectedBill = bills.find(b => b._id === selectedBillId);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get("http://localhost:7000/api/bill/household", {
          params: { householdId: householdId }
        });
        setBills(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBills();
  }, []);

  function getDaysUntilDue(dueDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(dueDate);
    const due = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  }

  async function addBill(e) {
    e.preventDefault();
    if (!newBillName || !newAmount) return;
    const total = parseFloat(newAmount);
    const splitAmount = parseFloat((total / ROOMMATES.length).toFixed(2));
    setNewBillName("");
    setNewAmount("");
    setNewDueDate("");
    setShowAddForm(false);
    try {
      await axios.post("http://localhost:7000/api/bill", {
        householdId: householdId,
        billName: newBillName,
        totalAmount: total,
        dueDate: newDueDate || null,
        shares: ROOMMATES.map(() => ({ amountOwed: splitAmount, isPaid: false })),
        comments: []
      });
      const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
      setBills(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteBill(billId) {
    setSelectedBillId(null);
    try {
      await axios.delete("http://localhost:7000/api/delete/bill/" + billId);
      const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
      setBills(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function togglePaid(billId, roommateId) {
    const bill = bills.find(b => b._id === billId);
    const updatedShares = bill.shares.map(s => s._id === roommateId ? { ...s, isPaid: !s.isPaid } : s);
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, shares: updatedShares });
      const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
      setBills(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function updateTotal(billId) {
    const newTotal = parseFloat(editTotalValue);
    if (isNaN(newTotal) || newTotal <= 0) return;
    const splitAmount = parseFloat((newTotal / ROOMMATES.length).toFixed(2));
    setEditingTotal(false);
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, totalAmount: newTotal, shares: bills.find(b => b._id === billId).shares.map(s => ({ ...s, amountOwed: splitAmount })) });
      const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
      setBills(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function updateDueDate(billId) {
    if (!editDueDateValue) return;
    setEditingDueDate(false);
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, dueDate: editDueDateValue });
      const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
      setBills(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function updateSplit(billId) {
    const bill = bills.find(b => b._id === billId);
    const newTotal = Object.values(customSplits).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    const updatedShares = bill.shares.map(s => ({ ...s, amountOwed: parseFloat(customSplits[s._id]) || s.amountOwed }));
    setEditingSplit(false);
    setCustomSplits({});
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, totalAmount: newTotal, shares: updatedShares });
      const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
      setBills(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function addComment(billId) {
    if (!newComment.trim()) return;
    const bill = bills.find(b => b._id === billId);
    const updatedComments = [...bill.comments, { author: "You", text: newComment.trim(), date: new Date().toLocaleDateString() }];
    setNewComment("");
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, comments: updatedComments });
      const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
      setBills(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function openBill(bill) {
    setSelectedBillId(bill._id);
    setActiveRoommate(null);
    setEditingTotal(false);
    setEditingDueDate(false);
    setEditingSplit(false);
    setNewComment("");
  }

  // --- BILL LIST VIEW ---
  if (!selectedBill) {
    return (
      <section className="layout">
        <Sidebar />
        <div className="body">
          <div className="apartment"><h1>BILLS</h1></div>
          <div style={{ padding: "20px" }}>

            <button className="btnGreen" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancel" : "+ Add Bill"}
            </button>

            {showAddForm && (
              <form className="billAddForm" onSubmit={addBill}>
                <div>
                  <label>Bill Name</label>
                  <input type="text" value={newBillName} onChange={e => setNewBillName(e.target.value)} placeholder="e.g. Electricity" />
                </div>
                <div>
                  <label>Total Amount ($)</label>
                  <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="e.g. 120" min="0" step="0.01" />
                </div>
                <div>
                  <label>Due Date</label>
                  <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
                </div>
                {newAmount && (
                  <p className="splitPreview">
                    Split {ROOMMATES.length} ways = <strong>${(parseFloat(newAmount) / ROOMMATES.length).toFixed(2)}</strong> each
                  </p>
                )}
                <button className="btnGreen" type="submit">Add Bill</button>
              </form>
            )}

            {bills.length === 0 && <p>No bills yet. Add one above!</p>}

            {bills.map(bill => {
              const paidCount = bill.shares.filter(s => s.isPaid).length;
              const daysLeft = bill.dueDate ? getDaysUntilDue(bill.dueDate) : null;
              return (
                <div key={bill._id} className="billCard" onClick={() => openBill(bill)}>
                  <div className="billCardHeader">
                    <div>
                      <h2>{bill.billName}</h2>
                      <div className="billMeta">
                        <span>Total: ${bill.totalAmount.toFixed(2)}</span>
                        {daysLeft !== null && (
                          <span className={daysLeft <= 0 ? "overdue" : ""}>
                            {daysLeft > 0 ? `  ·  Due in ${daysLeft} days` : daysLeft === 0 ? "  ·  Due today" : `  ·  Overdue by ${Math.abs(daysLeft)} days`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="billMeta">{paidCount}/{bill.shares.length} paid</span>
                      <button
                        className="btnRed"
                        style={{ marginLeft: "10px" }}
                        onClick={e => { e.stopPropagation(); deleteBill(bill._id); }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // --- BILL DETAIL VIEW ---
  const daysLeft = selectedBill.dueDate ? getDaysUntilDue(selectedBill.dueDate) : null;
  const filteredShares = activeRoommate
    ? selectedBill.shares.filter(s => s._id === activeRoommate)
    : selectedBill.shares;

  return (
    <section className="layout">
      <Sidebar />
      <div className="body">
        <div className="apartment"><h1>BILLS</h1></div>
        <div style={{ padding: "20px" }}>

          <button className="btnOutline" onClick={() => setSelectedBillId(null)}>← Back to Bills</button>

          {/* Header */}
          <div className="billDetailHeader">
            <h2>{selectedBill.billName}</h2>
            <div className="billMeta">
              <span>Total: ${selectedBill.totalAmount.toFixed(2)}</span>
              {daysLeft !== null && (
                <span className={daysLeft <= 0 ? "overdue" : ""}>
                  {daysLeft > 0 ? `  ·  Due in ${daysLeft} days` : daysLeft === 0 ? "  ·  Due today" : `  ·  Overdue by ${Math.abs(daysLeft)} days`}
                </span>
              )}
            </div>
          </div>

          {/* Roommate tabs */}
          <div className="roommateTabs">
            <button className={`tabBtn ${activeRoommate === null ? "active" : ""}`} onClick={() => setActiveRoommate(null)}>All</button>
            {ROOMMATES.map(r => (
              <button key={r.id} className={`tabBtn ${activeRoommate === r.id ? "active" : ""}`} onClick={() => setActiveRoommate(r.id)}>
                {r.name}
              </button>
            ))}
          </div>

          {/* Shares */}
          {filteredShares.map(share => (
            <div key={share._id} className={`shareRow ${share.isPaid ? "paid" : ""}`}>
              <span>Roommate</span>
              <span>${share.amountOwed.toFixed(2)}</span>
              <button className={share.isPaid ? "btnOutline" : "btnGreen"} onClick={() => togglePaid(selectedBill._id, share._id)}>
                {share.isPaid ? "Paid ✓" : "Mark Paid"}
              </button>
            </div>
          ))}

          {/* Actions */}
          <div className="billActions">
            <h3>Actions</h3>

            <div className="actionBlock">
              <button className="btnOutline" onClick={() => { setEditingTotal(!editingTotal); setEditTotalValue(selectedBill.totalAmount); }}>
                {editingTotal ? "Cancel" : "Update Total"}
              </button>
              {editingTotal && (
                <div style={{ marginTop: "8px" }}>
                  <input type="number" value={editTotalValue} onChange={e => setEditTotalValue(e.target.value)} min="0" step="0.01" />
                  <button className="btnGreen" onClick={() => updateTotal(selectedBill._id)}>Save</button>
                  {editTotalValue && <p className="splitPreview">New split: ${(parseFloat(editTotalValue) / ROOMMATES.length).toFixed(2)} each</p>}
                </div>
              )}
            </div>

            <div className="actionBlock">
              <button className="btnOutline" onClick={() => { setEditingDueDate(!editingDueDate); setEditDueDateValue(selectedBill.dueDate || ""); }}>
                {editingDueDate ? "Cancel" : "Change Due Date"}
              </button>
              {editingDueDate && (
                <div style={{ marginTop: "8px" }}>
                  <input type="date" value={editDueDateValue} onChange={e => setEditDueDateValue(e.target.value)} />
                  <button className="btnGreen" onClick={() => updateDueDate(selectedBill._id)}>Save</button>
                </div>
              )}
            </div>

            <div className="actionBlock">
              <button className="btnOutline" onClick={() => {
                if (!editingSplit) {
                  const splits = {};
                  selectedBill.shares.forEach(s => { splits[s._id] = s.amountOwed; });
                  setCustomSplits(splits);
                }
                setEditingSplit(!editingSplit);
              }}>
                {editingSplit ? "Cancel" : "Change Split"}
              </button>
              {editingSplit && (
                <div style={{ marginTop: "8px" }}>
                  {selectedBill.shares.map(share => (
                    <div key={share._id} style={{ marginBottom: "5px" }}>
                      <label>Roommate: $</label>
                      <input type="number" value={customSplits[share._id] || ""} onChange={e => setCustomSplits({ ...customSplits, [share._id]: e.target.value })} min="0" step="0.01" />
                    </div>
                  ))}
                  <p className="splitPreview">New total: ${Object.values(customSplits).reduce((sum, v) => sum + (parseFloat(v) || 0), 0).toFixed(2)}</p>
                  <button className="btnGreen" onClick={() => updateSplit(selectedBill._id)}>Save Split</button>
                </div>
              )}
            </div>

            <div className="actionBlock">
              <button className="btnRed" onClick={() => deleteBill(selectedBill._id)}>Delete Bill</button>
            </div>
          </div>

          {/* Comments */}
          <div className="commentsSection">
            <h3>Comments</h3>
            {selectedBill.comments.length === 0 && <p>No comments yet.</p>}
            {selectedBill.comments.map((c, i) => (
              <div key={i} className="comment">
                <strong>{c.author}</strong> <span style={{ fontSize: "12px" }}>({c.date})</span>
                <p style={{ margin: "2px 0" }}>{c.text}</p>
              </div>
            ))}
            <div className="commentInput">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={e => { if (e.key === "Enter") addComment(selectedBill._id); }}
              />
              <button className="btnGreen" onClick={() => addComment(selectedBill._id)}>Post</button>
            </div>
          </div>

          {/* Activity */}
          <div className="activitySection">
            <h3>Activity</h3>
            {selectedBill.shares.filter(s => s.isPaid).map(s => (
              <p key={s._id} style={{ margin: "4px 0" }}>Roommate paid ${s.amountOwed.toFixed(2)}</p>
            ))}
            {selectedBill.shares.every(s => !s.isPaid) && <p>No activity yet.</p>}
            {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && <p>Due date in {daysLeft} days</p>}
            {daysLeft !== null && daysLeft <= 0 && <p className="overdue">This bill is overdue!</p>}
          </div>

        </div>
      </div>
    </section>
  );
}

export default Bills;
