const Reservation = require('../models/Reservation.model');
const Table = require('../models/Table.model');

exports.createReservation = async (req, res) => {
  try {
    const { tableId, customerName, reservationTime } = req.body;

    // Ensure the table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Create a new reservation
    const newReservation = new Reservation({
      tableId,
      customerName,
      reservationTime,
    });

    await newReservation.save();

    // Update table status to 'reserved'
    table.status = 'reserved';
    await table.save();

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error creating reservation:', error.message);
    res.status(500).json({ error: 'Error creating reservation' });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('tableId', 'number status');
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ error: 'Error fetching reservations' });
  }
};
