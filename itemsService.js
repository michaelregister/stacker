import { db } from "../config/firebase"; // Adjust path to your firebase config
import { collection, addDoc, Timestamp } from "firebase/firestore";

/**
 * Adds a new silver item to the Firestore 'items' collection.
 * Includes tracking for Cost Basis (purchasePrice) and Date.
 *
 * @param {Object} itemData - The form data.
 * @returns {Promise<string>} The ID of the new document.
 */
export const addStackItem = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, "items"), {
      type: itemData.type,           // e.g., 'coin', 'bar', 'junk'
      name: itemData.name,
      quantity: Number(itemData.quantity),
      weight: Number(itemData.weight), // Weight per unit
      purity: Number(itemData.purity), // e.g., 0.999 or 0.90

      // New fields for P&L Tracking
      purchasePrice: Number(itemData.purchasePrice) || 0, // Total cost for this entry
      purchaseDate: itemData.purchaseDate
        ? Timestamp.fromDate(new Date(itemData.purchaseDate))
        : Timestamp.now(),

      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding stack item: ", error);
    throw error;
  }
};