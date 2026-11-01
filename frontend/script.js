
function loadBookings() {

    fetch("http://localhost:3000/api/bookings")
        .then(response => response.json())
        .then(result => {

            const bookingTable = document.getElementById("bookingTable");

            bookingTable.innerHTML = "";

            result.data.forEach(booking => {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${booking.booking_id}</td>
                    <td>${booking.lab_id}</td>
                    <td>${booking.requested_date}</td>
                    <td>${booking.start_time} - ${booking.end_time}</td>
                    <td>${booking.purpose}</td>
                    <td>${booking.status_id}</td>
                `;

                bookingTable.appendChild(row);

            });

        })
        .catch(error => {
            console.log("Error loading bookings:", error);
        });
}


document.getElementById("bookingForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const bookingData = {
        lab_id: document.getElementById("labId").value,
        schedule_id: document.getElementById("scheduleId").value,
        requested_date: document.getElementById("bookingDate").value,
        start_time: document.getElementById("startTime").value,
        end_time: document.getElementById("endTime").value,
        purpose: document.getElementById("purpose").value,
        status_id: 1
    };

    fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    })

    .then(response => response.json())

    .then(result => {

        const message = document.getElementById("message");

        if (result.success) {

            message.textContent = "Booking request submitted successfully!";
            message.style.color = "green";

            document.getElementById("bookingForm").reset();

            loadBookings();

        } else {

            message.textContent = result.error.message;
            message.style.color = "red";

        }

    })

    .catch(error => {
        console.log("Error submitting booking:", error);

        document.getElementById("message").textContent =
            "Unable to submit booking. Please try again.";
    });

});


loadBookings();
