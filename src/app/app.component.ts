import { Component } from '@angular/core';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  seats: any[] = [];
  bookedSeats: number[] = [];
  requestedSeats: number = 0;
  remainingSeats: number = 0;
  showModal: boolean = false;  // Controls the modal visibility
  seatLimitExceeded: boolean = false; // To handle cases where requested seats exceed 7

  constructor(private bookingService: BookingService) {
    // Fetch seat status from the service
    this.seats = this.bookingService.getSeats();
  }

  // Book seats when the user requests
  bookSeats() {
    const availableSeatsCount = this.seats.filter(seat => !seat.booked).length;

    // Check if the requested seats exceed the limit (7 seats)
    if (this.requestedSeats > 7) {
      this.seatLimitExceeded = true;
      return; // Stop further execution if seat limit is exceeded
    }

    // Check if there are enough seats left
    if (availableSeatsCount < this.requestedSeats) {
      this.remainingSeats = availableSeatsCount;
      this.showModal = true; // Show the modal if not enough seats are available
    } else {
      this.completeBooking(this.requestedSeats); // Proceed with booking if enough seats are available
    }
  }

  // Proceed with booking available seats
  completeBooking(requestedSeats: number) {
    // Reset any previous "just booked" status
    this.seats.forEach(seat => seat.justBooked = false);
    
    // Book the requested seats
    this.bookedSeats = this.bookingService.bookSeats(requestedSeats);

    // Mark the seats as "just booked" (yellow)
    this.bookedSeats.forEach(seatId => {
      this.seats[seatId - 1].justBooked = true;
    });

    this.showModal = false; // Hide the modal once booking is done
    this.seatLimitExceeded = false; // Reset seat limit error after successful booking
  }

  // User clicks 'Yes' to book the remaining seats
  bookRemainingSeats() {
    this.completeBooking(this.remainingSeats);
  }

  // User clicks 'No' to cancel the booking
  cancelBooking() {
    this.showModal = false; // Hide the modal without booking anything
  }
}
