
function loadBookings() {

    fetch("http://localhost:3000/api/bookings", {
    credentials: "include"
    })
        .then(response => response.json())
        .then(result => {

            const bookingTable = document.getElementById("bookingTable");

            bookingTable.innerHTML = "";

            result.data.forEach(booking => {

                const row = document.createElement("tr");

                const statusDropdown = `
                    <select id="status-${booking.booking_id}">
                        <option value="1" ${booking.status_id == 1 ? "selected" : ""}>Pending</option>
                        <option value="2" ${booking.status_id == 2 ? "selected" : ""}>Approved</option>
                        <option value="3" ${booking.status_id == 3 ? "selected" : ""}>Rejected</option>
                        <option value="4" ${booking.status_id == 4 ? "selected" : ""}>Cancelled</option>
                    </select>
                `;

                row.innerHTML = `
                    <td>${booking.booking_id}</td>
                    <td>${booking.lab_id}</td>
                    <td>${booking.requested_date}</td>
                    <td>${booking.start_time} - ${booking.end_time}</td>
                    <td>${booking.purpose}</td>
                    <td>${getStatusName(booking.status_id)}</td>
                    <td>
                        ${statusDropdown}
                        <button onclick="updateStatus(${booking.booking_id})">
                            Update
                        </button>
                    </td>
                `;

                bookingTable.appendChild(row);

            });

        })
        .catch(error => {
            console.log("Error loading bookings:", error);
        });
}

function getStatusName(statusId) {

    const statuses = {
        1: "Pending",
        2: "Approved",
        3: "Rejected",
        4: "Cancelled"
    };

    return statuses[statusId] || "Unknown";
}

function updateStatus(bookingId) {

    const statusId = document.getElementById(
        `status-${bookingId}`
    ).value;

    fetch(`http://localhost:3000/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status_id: Number(statusId)
        })
    })

    .then(response => response.json())

    .then(result => {

        const message = document.getElementById("message");

        if (result.success) {

            message.textContent = "Booking status updated successfully!";
            message.style.color = "green";

            loadBookings();

        } else {

            message.textContent = result.error.message;
            message.style.color = "red";

        }

    })

    .catch(error => {

        console.log("Error updating booking status:", error);

        document.getElementById("message").textContent =
            "Unable to update booking status. Please try again.";

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
    purpose: document.getElementById("purpose").value
    };

    fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        credentials: "include",
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