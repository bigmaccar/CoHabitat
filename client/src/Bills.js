import { Link } from "react-router-dom";
import React, { useState ,useEffect} from "react";
import axios from 'axios';

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

  const householdId = localStorage.getItem("householdId") || "";
  const currentUserName = localStorage.getItem("userName") || "User";

  const [bills, setBills] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billMessage, setBillMessage] = useState("");

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
    const fetchData = async () => {
      if (!householdId) {
        setLoading(false);
        return;
      }

      try {
        const [householdRes, usersRes, billsRes] = await Promise.all([
          axios.get("http://localhost:7000/api/household", { params: { id: householdId } }),
          axios.get("http://localhost:7000/api/users"),
          axios.get("http://localhost:7000/api/bill/household", { params: { householdId } })
        ]);
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const memberUsers = (householdRes.data.members || []).map(member => {
          const user = users.find(item => String(item._id) === String(member.userId));
          return user ? { ...user, isAdmin: member.isAdmin } : null;
        }).filter(Boolean);
        setRoommates(memberUsers);
        setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
        setBillMessage("");
      } catch (err) {
        setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Bills could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [householdId]);

  async function refreshBills() {
    const res = await axios.get("http://localhost:7000/api/bill/household", { params: { householdId } });
    setBills(Array.isArray(res.data) ? res.data : []);
  }

  function getRoommateName(userId) {
    const roommate = roommates.find(item => String(item._id) === String(userId));
    return roommate ? `${roommate.firstName || ""} ${roommate.lastName || ""}`.trim() || roommate.email : "Roommate";
  }

  function getRemainingAmount(bill) {
    return bill.shares.filter(s => !s.isPaid).reduce((sum, s) => sum + s.amountOwed, 0);
  }

  function getDaysUntilDue(dueDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(dueDate);
    const due = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  }

  async function addBill(e) {
    e.preventDefault();
    if (!householdId) {
      setBillMessage("Create or join a household before adding bills.");
      return;
    }
    if (roommates.length === 0) {
      setBillMessage("Add roommates before adding bills.");
      return;
    }
    if (!newBillName || !newAmount) return;
    const total = parseFloat(newAmount);
    const splitAmount = parseFloat((total / roommates.length).toFixed(2));
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
        shares: roommates.map(roommate => ({ userId: roommate._id, amountOwed: splitAmount, isPaid: false })),
        comments: []
      });
      await refreshBills();
      setBillMessage("Bill added.");
    } catch (err) {
      setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Bill could not be added.");
    }
  }

  async function deleteBill(billId) {
    setSelectedBillId(null);
    try {
      await axios.delete("http://localhost:7000/api/delete/bill/" + billId);
      await refreshBills();
      setBillMessage("Bill deleted.");
    } catch (err) {
      setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Bill could not be deleted.");
    }
  }

  async function togglePaid(billId, roommateId) {
    const bill = bills.find(b => b._id === billId);
    const updatedShares = bill.shares.map(s => s._id === roommateId ? { ...s, isPaid: !s.isPaid } : s);
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, shares: updatedShares });
      await refreshBills();
    } catch (err) {
      setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Bill could not be updated.");
    }
  }

  async function updateTotal(billId) {
    const newTotal = parseFloat(editTotalValue);
    if (isNaN(newTotal) || newTotal <= 0) return;
    const bill = bills.find(b => b._id === billId);
    const splitCount = bill.shares.length || roommates.length || 1;
    const splitAmount = parseFloat((newTotal / splitCount).toFixed(2));
    setEditingTotal(false);
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, totalAmount: newTotal, shares: bill.shares.map(s => ({ ...s, amountOwed: splitAmount })) });
      await refreshBills();
    } catch (err) {
      setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Bill total could not be updated.");
    }
  }

  async function updateDueDate(billId) {
    if (!editDueDateValue) return;
    setEditingDueDate(false);
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, dueDate: editDueDateValue });
      await refreshBills();
    } catch (err) {
      setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Due date could not be updated.");
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
      await refreshBills();
    } catch (err) {
      setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Split could not be updated.");
    }
  }

  async function addComment(billId) {
    if (!newComment.trim()) return;
    const bill = bills.find(b => b._id === billId);
    const updatedComments = [...(bill.comments || []), { author: currentUserName, text: newComment.trim(), date: new Date().toLocaleDateString() }];
    setNewComment("");
    try {
      await axios.put("http://localhost:7000/api/update/bill/" + billId, { _id: billId, comments: updatedComments });
      await refreshBills();
    } catch (err) {
      setBillMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Comment could not be added.");
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

  if (!householdId) {
    return (
      <section className="layout">
        <Sidebar />
        <div className="body">
          <div className="apartment"><h1>BILLS</h1></div>
          <div style={{ padding: "20px" }}>
            <p>Create or join a household in <Link to="/Settings">Settings</Link> before using bills.</p>
          </div>
        </div>
      </section>
    );
  }

  // --- BILL LIST VIEW ---
  if (!selectedBill) {
    return (
      <section className="layout">
        <Sidebar />
        <div className="body">
          <div className="apartment"><h1>BILLS</h1></div>
          <div style={{ padding: "20px" }}>
            {loading && <p>Loading bills...</p>}
            {billMessage && <p style={{ color: billMessage.includes("added") || billMessage.includes("deleted") ? "green" : "red" }}>{billMessage}</p>}
            {!loading && roommates.length === 0 && <p>Add household members before creating bills.</p>}

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
                    Split {roommates.length} ways = <strong>${(parseFloat(newAmount) / Math.max(roommates.length, 1)).toFixed(2)}</strong> each
                  </p>
                )}
                <button className="btnGreen" type="submit">Add Bill</button>
              </form>
            )}

            {!loading && bills.length === 0 && <p>No bills yet. Add one above!</p>}

            {bills.map(bill => {
              const paidCount = bill.shares.filter(s => s.isPaid).length;
              const daysLeft = bill.dueDate ? getDaysUntilDue(bill.dueDate) : null;
              const remaining = getRemainingAmount(bill);
              return (
                <div key={bill._id} className="billCard" onClick={() => openBill(bill)}>
                  <div className="billCardHeader">
                    <div>
                      <h2>{bill.billName}</h2>
                      <div className="billMeta">
                        <span>Total: ${bill.totalAmount.toFixed(2)}</span>
                        {remaining < bill.totalAmount && (
                          <span className={remaining === 0 ? "remainingPaid" : "remainingAmount"}>
                            · Remaining: ${remaining.toFixed(2)}
                          </span>
                        )}
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
  const remaining = getRemainingAmount(selectedBill);
  const filteredShares = activeRoommate
    ? selectedBill.shares.filter(s => String(s.userId) === String(activeRoommate))
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
              {remaining < selectedBill.totalAmount && (
                <span className={remaining === 0 ? "remainingPaid" : "remainingAmount"}>
                  · {remaining === 0 ? "Fully Paid ✓" : `Remaining: $${remaining.toFixed(2)}`}
                </span>
              )}
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
            {roommates.map(r => (
              <button key={r._id} className={`tabBtn ${activeRoommate === r._id ? "active" : ""}`} onClick={() => setActiveRoommate(r._id)}>
                {getRoommateName(r._id)}
              </button>
            ))}
          </div>

          {/* Shares */}
          {filteredShares.map(share => (
            <div key={share._id} className={`shareRow ${share.isPaid ? "paid" : ""}`}>
              <span>{getRoommateName(share.userId)}</span>
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
                  {editTotalValue && <p className="splitPreview">New split: ${(parseFloat(editTotalValue) / Math.max(selectedBill.shares.length, 1)).toFixed(2)} each</p>}
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
                      <label>{getRoommateName(share.userId)}: $</label>
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
            {(!selectedBill.comments || selectedBill.comments.length === 0) && <p>No comments yet.</p>}
            {(selectedBill.comments || []).map((c, i) => (
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
              <p key={s._id} style={{ margin: "4px 0" }}>{getRoommateName(s.userId)} paid ${s.amountOwed.toFixed(2)}</p>
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
