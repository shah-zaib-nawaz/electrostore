import { auth } from '../src/lib/auth';
import { MongoClient } from 'mongodb';

async function main() {
  const email = process.argv[2] || 'admin@electrostore.ai';
  const password = process.argv[3] || 'AdminElectro2026!';
  const name = process.argv[4] || 'Store Administrator';

  console.log(`🔐 Creating/Promoting admin account: ${email}...`);

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is required.');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  try {
    // Check if user already exists
    const existingUser = await db.collection('user').findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      console.log(`ℹ️ User ${email} already exists. Elevating role to 'admin'...`);
      await db.collection('user').updateOne(
        { _id: existingUser._id },
        { $set: { role: 'admin', updatedAt: new Date() } }
      );
      console.log(`✅ User ${email} has been successfully promoted to 'admin'!`);
    } else {
      console.log(`Creating new user with Better Auth...`);
      const userRes = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (!userRes || !userRes.user) {
        throw new Error('Failed to create user via Better Auth');
      }

      // Elevate to admin
      await db.collection('user').updateOne(
        { email: email.toLowerCase().trim() },
        { $set: { role: 'admin', updatedAt: new Date() } }
      );

      console.log(`🎉 Admin account created successfully!`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: admin`);
    }
  } catch (err: any) {
    console.error('❌ Failed to create admin:', err.message);
  } finally {
    await client.close();
  }
}

main();
