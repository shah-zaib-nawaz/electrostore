import { connectToDatabase } from '@/lib/db';
import { Cart } from '@/server/models/Cart';
import mongoose from 'mongoose';

export async function mergeGuestCartToUser(userId: string, guestSessionId?: string) {
  if (!guestSessionId) return null;

  await connectToDatabase();

  const guestCart = await Cart.findOne({ guestSessionId });
  if (!guestCart || guestCart.items.length === 0) return null;

  const userObjectId = new mongoose.Types.ObjectId(userId);
  let userCart = await Cart.findOne({ userId: userObjectId });

  if (!userCart) {
    // If user has no cart, assign guest cart directly to user
    guestCart.userId = userObjectId as any;
    guestCart.guestSessionId = undefined;
    await guestCart.save();
    console.log(`[CartService] Transferred guest cart to user ${userId}`);
    return guestCart;
  }

  // Merge items from guest cart into user cart
  for (const guestItem of guestCart.items) {
    const existingIndex = userCart.items.findIndex(
      (item) => item.productId.toString() === guestItem.productId.toString()
    );

    if (existingIndex > -1) {
      userCart.items[existingIndex].quantity += guestItem.quantity;
    } else {
      userCart.items.push(guestItem);
    }
  }

  await userCart.save();
  await Cart.findByIdAndDelete(guestCart._id);

  console.log(`[CartService] Merged guest cart items into existing cart for user ${userId}`);
  return userCart;
}
