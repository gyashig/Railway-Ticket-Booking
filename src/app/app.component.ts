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

  constructor(private bookingService: BookingService) {
    // Fetch seat status from the service
    this.seats = this.bookingService.getSeats();
  }

  // Book seats when the user requests
  bookSeats() {
    const availableSeatsCount = this.seats.filter(seat => !seat.booked).length;

    // Check if there are enough seats left
    if (availableSeatsCount < this.requestedSeats) {
      this.remainingSeats = availableSeatsCount;
      this.showModal = true; // Show the modal
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
