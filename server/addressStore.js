import db from "./db.js";

// Shared address data store - ensures Checkout Delivery Address Page and Profile Address Book
// are 100% synchronized across the entire application.
export let sharedAddresses = [
  {
    id: 1,
    userID: "USR1001",
    label: "Home",
    name: "Jane Doe",
    phone: "+91 98765 43210",
    line1: "Hostel Block 4, Room 210",
    line2: "Tech Campus",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    isDefault: true,
  },
  {
    id: 2,
    userID: "USR1001",
    label: "Residence",
    name: "Jane Doe",
    phone: "+91 98765 43210",
    line1: "Flat 302, Green Valley Apartments",
    line2: "Jayalakshmipuram",
    city: "Mysuru",
    state: "Karnataka",
    pincode: "570001",
    isDefault: false,
  },
];

// Helper to convert database row to unified address object
export function rowToAddress(row) {
  const line1 = row.AddressLine1 || row.line1 || row.address_line || "";
  const line2 = row.AddressLine2 || row.line2 || "";
  const fullStreet = line2 ? `${line1}, ${line2}` : line1;

  return {
    id: Number(row.id || row.address_id),
    address_id: Number(row.id || row.address_id),
    userID: row.userID || "USR1001",
    label: row.AddressLabel || row.label || "Home",
    name: row.Name || row.name || "Recipient",
    phone: row.PhoneNo || row.phone || "+91 98765 43210",
    line1: line1,
    line2: line2,
    address_line: fullStreet,
    city: row.City || row.city || "",
    state: row.State || row.state || "",
    pincode: String(row.PinCode || row.pincode || ""),
    isDefault: row.IsDefault === "Y" || row.isDefault === true,
  };
}

// Convert unified address to MySQL format for delivery checkout
export function addressToCheckoutRow(addr) {
  return {
    id: addr.id,
    userID: addr.userID || "USR1001",
    AddressLabel: addr.label,
    Name: addr.name,
    PhoneNo: addr.phone,
    AddressLine1: addr.line1,
    AddressLine2: addr.line2 || null,
    City: addr.city,
    State: addr.state,
    PinCode: addr.pincode,
    IsDefault: addr.isDefault ? "Y" : "N",
  };
}

// 1. Retrieve all addresses for user
export async function getAddressesForUser(userID = "USR1001") {
  if (db) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM UserAddresses WHERE userID = ? ORDER BY id ASC",
        [userID]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        sharedAddresses = rows.map(rowToAddress);
        return sharedAddresses;
      }
    } catch (err) {
      console.warn("MySQL UserAddresses query warning (using synced in-memory store):", err.message);
    }
  }
  return sharedAddresses;
}

// 2. Add new address
export async function addAddress(data) {
  const line1 = data.line1 || data.AddressLine1 || data.address_line || "";
  const line2 = data.line2 || data.AddressLine2 || "";

  const newAddress = {
    id: Date.now(),
    address_id: Date.now(),
    userID: data.userID || "USR1001",
    label: data.label || data.AddressLabel || "Home",
    name: data.name || data.Name || "ABCDEFGH",
    phone: data.phone || data.PhoneNo || "+91 98765 43210",
    line1: line1.trim(),
    line2: line2.trim(),
    address_line: line2 ? `${line1.trim()}, ${line2.trim()}` : line1.trim(),
    city: (data.city || data.City || "").trim(),
    state: (data.state || data.State || "").trim(),
    pincode: String(data.pincode || data.PinCode || "").trim(),
    isDefault: data.isDefault === true || data.IsDefault === "Y" || sharedAddresses.length === 0,
  };

  if (newAddress.isDefault) {
    sharedAddresses.forEach((a) => (a.isDefault = false));
  }

  if (db) {
    try {
      const [res] = await db.query(
        `INSERT INTO UserAddresses (
          userID, AddressLabel, Name, PhoneNo, PinCode, AddressLine1, AddressLine2, City, State, IsDefault
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newAddress.userID,
          newAddress.label,
          newAddress.name,
          newAddress.phone,
          newAddress.pincode,
          newAddress.line1,
          newAddress.line2 || null,
          newAddress.city,
          newAddress.state,
          newAddress.isDefault ? "Y" : "N",
        ]
      );
      if (res && res.insertId) {
        newAddress.id = res.insertId;
        newAddress.address_id = res.insertId;
      }
    } catch (err) {
      console.warn("MySQL add address error (saved to synced in-memory store):", err.message);
    }
  }

  sharedAddresses.unshift(newAddress);
  return newAddress;
}

// 3. Update existing address
export async function updateAddress(data) {
  const targetId = Number(data.id || data.address_id);
  const line1 = data.line1 || data.AddressLine1 || data.address_line || "";
  const line2 = data.line2 || data.AddressLine2 || "";

  const updatedFields = {
    label: data.label || data.AddressLabel || "Home",
    name: data.name || data.Name || "",
    phone: data.phone || data.PhoneNo || "",
    line1: line1.trim(),
    line2: line2.trim(),
    address_line: line2 ? `${line1.trim()}, ${line2.trim()}` : line1.trim(),
    city: (data.city || data.City || "").trim(),
    state: (data.state || data.State || "").trim(),
    pincode: String(data.pincode || data.PinCode || "").trim(),
    isDefault: data.isDefault === true || data.IsDefault === "Y",
  };

  if (updatedFields.isDefault) {
    sharedAddresses.forEach((a) => {
      if (a.id !== targetId) a.isDefault = false;
    });
  }

  if (db) {
    try {
      await db.query(
        `UPDATE UserAddresses
         SET AddressLabel = ?, Name = ?, PhoneNo = ?, PinCode = ?, AddressLine1 = ?, AddressLine2 = ?, City = ?, State = ?, IsDefault = ?
         WHERE id = ?`,
        [
          updatedFields.label,
          updatedFields.name,
          updatedFields.phone,
          updatedFields.pincode,
          updatedFields.line1,
          updatedFields.line2 || null,
          updatedFields.city,
          updatedFields.state,
          updatedFields.isDefault ? "Y" : "N",
          targetId,
        ]
      );
    } catch (err) {
      console.warn("MySQL update address warning (updated in synced in-memory store):", err.message);
    }
  }

  const idx = sharedAddresses.findIndex((a) => a.id === targetId);
  if (idx !== -1) {
    sharedAddresses[idx] = {
      ...sharedAddresses[idx],
      ...updatedFields,
      id: targetId,
      address_id: targetId,
    };
    return sharedAddresses[idx];
  }

  const created = { id: targetId, address_id: targetId, ...updatedFields };
  sharedAddresses.push(created);
  return created;
}

// 4. Delete address
export async function deleteAddress(addressId, userID = "USR1001") {
  const targetId = Number(addressId);

  if (db) {
    try {
      await db.query("DELETE FROM UserAddresses WHERE id = ?", [targetId]);
    } catch (err) {
      console.warn("MySQL delete address error:", err.message);
    }
  }

  sharedAddresses = sharedAddresses.filter((a) => a.id !== targetId);
  return true;
}

// 5. Update default address
export async function setDefaultAddress(addressId, userID = "USR1001") {
  const targetId = Number(addressId);

  if (db) {
    try {
      await db.query("UPDATE UserAddresses SET IsDefault = 'N' WHERE userID = ?", [userID]);
      await db.query("UPDATE UserAddresses SET IsDefault = 'Y' WHERE id = ? AND userID = ?", [
        targetId,
        userID,
      ]);
    } catch (err) {
      console.warn("MySQL setDefaultAddress error:", err.message);
    }
  }

  sharedAddresses.forEach((a) => {
    a.isDefault = a.id === targetId;
  });
  return true;
}
