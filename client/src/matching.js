function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeLocation(value) {
    return normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeTags(tags) {
    return (Array.isArray(tags) ? tags : [])
        .map(tag => normalize(tag))
        .filter(Boolean);
}

function getListingLocation(listing) {
    return normalizeLocation(listing.location || [listing.city, listing.state].filter(Boolean).join(", "));
}

function getDisplayName(user) {
    if (!user) {
        return "Lister";
    }
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Lister";
}

function getMatchingTags(userTags, targetTags) {
    const normalizedTargetTags = normalizeTags(targetTags);
    return normalizeTags(userTags).filter(tag => normalizedTargetTags.includes(tag));
}

function formatTags(tags) {
    return tags.join(", ");
}

export function getListingMatchDetails(user, listing, owner) {
    const userTags = normalizeTags(user?.lifestyleTags);
    const listingTags = normalizeTags(listing?.lifestyleTags);
    const idealTags = normalizeTags(listing?.idealRoommateTags);
    const ownerTags = normalizeTags(owner?.lifestyleTags);
    const preferredLocation = normalizeLocation(user?.preferredLocation);
    const preferredCity = preferredLocation.split(",")[0].trim();
    const listingLocation = getListingLocation(listing);
    const locationMatches = !preferredCity || listingLocation.includes(preferredCity);
    const budgetMatches = !user?.budgetMax || !listing?.rentAmount || Number(listing.rentAmount) <= Number(user.budgetMax);
    const listingLifestyleMatches = getMatchingTags(userTags, listingTags);
    const idealRoommateMatches = getMatchingTags(userTags, idealTags);
    const tenantLifestyleMatches = getMatchingTags(userTags, ownerTags);
    const hasLifestyleSignals = listingTags.length > 0 || idealTags.length > 0 || ownerTags.length > 0;
    const hasLifestyleMatch = listingLifestyleMatches.length > 0 || idealRoommateMatches.length > 0 || tenantLifestyleMatches.length > 0;
    const lifestyleMatches = userTags.length === 0 || !hasLifestyleSignals || hasLifestyleMatch;
    const profileComplete = Boolean(preferredLocation || user?.budgetMax || userTags.length > 0);
    const isActive = listing?.isActive !== false;
    const isOwnListing = String(listing?.createdBy || "") === String(user?._id || "");
    const isBlacklisted = (listing?.blacklistedUserIds || []).map(String).includes(String(user?._id || ""));
    const isMatch = profileComplete && isActive && !isOwnListing && !isBlacklisted && locationMatches && budgetMatches && lifestyleMatches;
    const reasons = [];

    if (locationMatches && preferredCity) {
        reasons.push(`near ${preferredCity}`);
    }
    if (budgetMatches && user?.budgetMax) {
        reasons.push(`within your $${user.budgetMax} budget`);
    }
    if (listingLifestyleMatches.length > 0) {
        reasons.push(`apartment lifestyle: ${formatTags(listingLifestyleMatches)}`);
    }
    if (idealRoommateMatches.length > 0) {
        reasons.push(`lister wants: ${formatTags(idealRoommateMatches)}`);
    }
    if (tenantLifestyleMatches.length > 0) {
        reasons.push(`tenant match with ${getDisplayName(owner)}: ${formatTags(tenantLifestyleMatches)}`);
    }
    if (profileComplete && reasons.length === 0 && isMatch) {
        reasons.push("matches your profile basics");
    }

    const score = [locationMatches && preferredCity, budgetMatches && user?.budgetMax, listingLifestyleMatches.length > 0, idealRoommateMatches.length > 0, tenantLifestyleMatches.length > 0]
        .filter(Boolean)
        .length;

    return {
        isMatch,
        profileComplete,
        reasons,
        score,
        ownerName: getDisplayName(owner),
        tenantLifestyleMatches,
        idealRoommateMatches,
        listingLifestyleMatches
    };
}

export function isMatchingListing(user, listing, owner) {
    return getListingMatchDetails(user, listing, owner).isMatch;
}
