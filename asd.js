const mongoose = require('mongoose');

const run = async () => {
  const db = await mongoose.connect('mongodb://localhost:27017/trucking');
  db.connection.collection('customers').deleteMany({});
  const customerInitials = (
    await db.connection.collection('transactions').distinct('customer')
  ).filter((c) => c);
  for (initial of customerInitials) {
    await db.connection.collection('customers').insertOne({ initial });
  }
  const customers = await db.connection
    .collection('customers')
    .find({})
    .toArray();

  for (customer of customers) {
    await db.connection.collection('transactions').updateMany(
      {
        customer: customer.initial,
      },
      {
        $set: {
          customer: {
            customerId: customer._id.toString(),
            initial: customer.initial,
          },
        },
      }
    );
  }

  db.connection.close();
};

run();
