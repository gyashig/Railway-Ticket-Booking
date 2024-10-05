import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  seats: Array<{ id: number, booked: boolean, justBooked?: boolean }> = [];

  constructor() {
    // Initialize 80 seats
    for (let i = 1; i <= 80; i++) {
      this.seats.push({ id: i, booked: false });
    }

    // Pre-book seats based on the custom pattern
    this.preBookSeats();
  }

  // Pre-book seats with a custom pattern for each row
  preBookSeats() {
    const rows = [
      { rowNumber: 1, seatsToBook: 5 },  // Row 1: 5 booked, 2 available
      { rowNumber: 2, seatsToBook: 6 },  // Row 2: 6 booked, 1 available
      { rowNumber: 3, seatsToBook: 3 },  // Row 3: 3 booked, 4 available
      { rowNumber: 4, seatsToBook: 7 },  // Row 4: 7 booked, 0 available (full row)
      { rowNumber: 5, seatsToBook: 5 },  // Row 5: 5 booked, 2 available
      { rowNumber: 6, seatsToBook: 4 },  // Row 6: 4 booked, 3 available
      { rowNumber: 7, seatsToBook: 2 },  // Row 7: 2 booked, 5 available
      { rowNumber: 8, seatsToBook: 6 },  // Row 8: 6 booked, 1 available
      { rowNumber: 9, seatsToBook: 7 },  // Row 9: 7 booked, 0 available
      { rowNumber: 10, seatsToBook: 3 }, // Row 10: 3 booked, 4 available
      { rowNumber: 11, seatsToBook: 1 }, // Row 11: 1 booked, 6 available
      { rowNumber: 12, seatsToBook: 0 }  // Row 12 (last row): 0 booked, 3 available
    ];

    // Apply the pre-booking for each row based on the custom pattern
    rows.forEach(row => {
      const rowStart = (row.rowNumber - 1) * 7;
      for (let i = 0; i < row.seatsToBook; i++) {
        this.seats[rowStart + i].booked = true; // Mark the specified number of seats as booked
      }
    });
  }

  // Method to book seats, analyzing the entire matrix and selecting the best option
  bookSeats(requestedSeats: number): number[] {
    let bookedSeats: number[] = [];

    // Step 1: Try to find the most contiguous block of seats
    const availableBlocks = this.getAvailableSeatBlocks();

    // Step 2: Sort blocks by proximity and size
    availableBlocks.sort((a, b) => {
      if (a.rowsUsed === b.rowsUsed) {
        return b.seatsAvailable - a.seatsAvailable; // Prioritize larger blocks if rows used are the same
      }
      return a.rowsUsed - b.rowsUsed; // Prioritize fewer rows used
    });

    // Step 3: Try to book the seats from the best available block
    for (const block of availableBlocks) {
      if (block.seatsAvailable >= requestedSeats) {
        // Book the required number of seats from the best block
        for (let i = 0; i < requestedSeats; i++) {
          this.seats[block.seats[i].id - 1].booked = true;
          bookedSeats.push(block.seats[i].id);
        }
        return bookedSeats;  // Booking is complete
      }
    }

    // Step 4: If no contiguous block can satisfy, book scattered seats
    bookedSeats = this.bookScatteredSeats(requestedSeats);

    if (bookedSeats.length < requestedSeats) {
      console.log(`Not enough seats available to fulfill the request of ${requestedSeats} seats.`);
    }

    return bookedSeats;
  }

  // Function to get available seat blocks across the entire seat matrix
  getAvailableSeatBlocks() {
    const availableBlocks = [];

    // Iterate through each row and find available seat blocks
    for (let row = 0; row < 11; row++) {
      const start = row * 7;
      const rowSeats = this.seats.slice(start, start + 7);
      let availableSeats = [];

      // Collect consecutive available seats in this row
      for (let i = 0; i < rowSeats.length; i++) {
        if (!rowSeats[i].booked) {
          availableSeats.push(rowSeats[i]);
        } else if (availableSeats.length > 0) {
          // Push the block of available seats found so far
          availableBlocks.push({
            seats: availableSeats,
            seatsAvailable: availableSeats.length,
            rowsUsed: 1
          });
          availableSeats = [];
        }
      }

      // Push any remaining available seats in the row
      if (availableSeats.length > 0) {
        availableBlocks.push({
          seats: availableSeats,
          seatsAvailable: availableSeats.length,
          rowsUsed: 1
        });
      }
    }

    // Combine adjacent rows if necessary
    for (let row = 0; row < 10; row++) {
      const rowSeats = this.seats.slice(row * 7, (row + 1) * 7);
      const nextRowSeats = this.seats.slice((row + 1) * 7, (row + 2) * 7);

      const combinedSeats = rowSeats.concat(nextRowSeats).filter(seat => !seat.booked);
      if (combinedSeats.length > 0) {
        availableBlocks.push({
          seats: combinedSeats,
          seatsAvailable: combinedSeats.length,
          rowsUsed: 2
        });
      }
    }

    // Handle the last row separately (it has only 3 seats)
    const lastRowSeats = this.seats.slice(77, 80); // Seats 78, 79, and 80
    const availableLastRowSeats = lastRowSeats.filter(seat => !seat.booked);
    if (availableLastRowSeats.length > 0) {
      availableBlocks.push({
        seats: availableLastRowSeats,
        seatsAvailable: availableLastRowSeats.length,
        rowsUsed: 1
      });
    }

    return availableBlocks;
  }

  // Function to book scattered seats if no contiguous block is available
  bookScatteredSeats(requestedSeats: number): number[] {
    let bookedSeats: number[] = [];

    // Iterate over all seats and book scattered seats if needed
    for (let i = 0; i < this.seats.length && bookedSeats.length < requestedSeats; i++) {
      if (!this.seats[i].booked) {
        this.seats[i].booked = true;
        bookedSeats.push(this.seats[i].id);
      }
    }

    return bookedSeats;
  }

  // Method to get all seats
  getSeats() {
    return this.seats;
  }
}
