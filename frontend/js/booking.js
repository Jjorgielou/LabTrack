document.addEventListener("DOMContentLoaded", () => {
    const labSelect = document.getElementById("labSelect");
    const requestedDate = document.getElementById("requestedDate");
    const startTime = document.getElementById("startTime");
    const endTime = document.getElementById("endTime");
    const purpose = document.getElementById("purpose");
    const bookingForm = document.getElementById("bookingForm");
    const submitButton = document.getElementById("submitButton");
    const scheduleDisplay = document.getElementById("scheduleDisplay");

    const scheduleManagement = document.getElementById("scheduleManagement");
    const scheduleForm = document.getElementById("scheduleForm");
    const scheduleLab = document.getElementById("scheduleLab");
    const scheduleDate = document.getElementById("scheduleDate");
    const scheduleStart = document.getElementById("scheduleStart");
    const scheduleEnd = document.getElementById("scheduleEnd");
    const createScheduleButton = document.getElementById("createScheduleButton");

    const pageMessage = document.getElementById("pageMessage");
const logoutButton = document.getElementById("logoutButton");
    const formMessage = document.getElementById("formMessage");
    const scheduleMessage = document.getElementById("scheduleMessage");
    const bookingMessage = document.getElementById("bookingMessage");
    const bookingTableBody = document.getElementById("bookingTableBody");
    const scheduleTableBody = document.getElementById("scheduleTableBody");
    const scheduleListMessage = document.getElementById("scheduleListMessage");

    const STATUS_PENDING = 1;
    const STATUS_APPROVED = 2;
    const STATUS_REJECTED = 3;

    let currentUser = null;

    function showMessage(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `message ${type}`;
    }

    function clearMessage(element) {
        if (!element) return;
        element.textContent = "";
        element.className = "message";
    }

    function getDate(value) {
        if (!value) return "";

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getTime(value) {
        return value ? String(value).substring(0, 5) : "";
    }

    function formatDate(value) {
        const date = getDate(value);
        if (!date) return "—";

        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    function formatTime(value) {
        const time = getTime(value);
        if (!time) return "—";

        const [hour, minute] = time.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
    }

    function getStatusClass(status) {
        const value = String(status || "").toLowerCase();

        if (value.includes("approved")) return "approved";
        if (value.includes("rejected")) return "rejected";

        return "pending";
    }

    function isAdmin() {
        return String(currentUser?.role || "").toLowerCase() === "admin";
    }

    function canManageSchedules() {
    const role = String(currentUser?.role || "").toLowerCase();

        return role === "admin" || role === "laboratory staff";
    }

    function isAvailableLaboratory(lab) {
        return Number(lab.status_id) === 1 ||
            String(lab.status_name || "").toLowerCase() === "available";
    }

    function isScheduleAvailable(schedule) {
        return schedule.is_available === undefined ||
            schedule.is_available === null ||
            schedule.is_available === true ||
            Number(schedule.is_available) === 1;
    }

    function getToday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function resetBookingFields() {
        requestedDate.value = "";
        requestedDate.disabled = !labSelect.value;

        startTime.value = "";
        endTime.value = "";

        startTime.disabled = !labSelect.value;
        endTime.disabled = !labSelect.value;

        if (scheduleDisplay) {
            scheduleDisplay.textContent =
                "Select a laboratory and date to view its schedules.";
        }
    }

    async function loadCurrentUser() {
        const response = await apiRequest("/auth/me");
        currentUser = response.user;

        const role = String(currentUser.role || "").toLowerCase();

        if (role === "admin" || role === "laboratory staff") {
            scheduleManagement.classList.remove("hidden");
        } else {
            scheduleManagement.classList.add("hidden");
        }
    }

    async function loadLaboratories() {
        const response = await apiRequest("/laboratories");
        const laboratories = response.data || [];

        const availableLabs = laboratories.filter(isAvailableLaboratory);

        labSelect.innerHTML =
            '<option value="">Select a laboratory</option>';

        scheduleLab.innerHTML =
            '<option value="">Select a laboratory</option>';

        availableLabs.forEach(lab => {
            const option = document.createElement("option");
            option.value = lab.lab_id;
            option.textContent =
                `${lab.lab_name} - ${lab.location || "No location"}`;
            labSelect.appendChild(option);

            const scheduleOption = document.createElement("option");
            scheduleOption.value = lab.lab_id;
            scheduleOption.textContent =
                `${lab.lab_name} - ${lab.location || "No location"}`;
            scheduleLab.appendChild(scheduleOption);
        });

        if (!availableLabs.length) {
            labSelect.innerHTML =
                '<option value="">No available laboratories</option>';

            scheduleLab.innerHTML =
                '<option value="">No available laboratories</option>';
        }
    }

        // LOAD EXISTING SCHEDULES
    async function loadScheduleList() {
        if (!canManageSchedules() || !scheduleTableBody) return;

        try {
            scheduleTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">Loading schedules...</td>
                </tr>
            `;

            const response = await apiRequest("/schedules");
            const schedules = response.data || [];

            scheduleTableBody.innerHTML = "";

            if (!schedules.length) {
                scheduleTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty">
                            No laboratory schedules found.
                        </td>
                    </tr>
                `;
                return;
            }

            schedules.forEach(schedule => {
                const row = document.createElement("tr");

                const values = [
                    schedule.schedule_id,
                    schedule.lab_name || `Laboratory ${schedule.lab_id}`,
                    formatDate(schedule.schedule_date),
                    formatTime(schedule.start_time),
                    formatTime(schedule.end_time)
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                const actionCell = document.createElement("td");
                const deleteButton = document.createElement("button");

                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.style.background = "#b94a48";
                deleteButton.style.padding = "8px 12px";

                deleteButton.addEventListener("click", () => {
                    deleteSchedule(schedule.schedule_id, deleteButton);
                });

                actionCell.appendChild(deleteButton);
                row.appendChild(actionCell);

                scheduleTableBody.appendChild(row);
            });

        } catch (error) {
            scheduleTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        Unable to load laboratory schedules.
                    </td>
                </tr>
            `;

            showMessage(
                scheduleListMessage,
                error.message || "Unable to load schedules.",
                "error"
            );
        }
    }

    // DELETE A LABORATORY SCHEDULE
    async function deleteSchedule(scheduleId, button) {
        if (!canManageSchedules()) {
            showMessage(
                scheduleListMessage,
                "You are not authorized to delete schedules.",
                "error"
            );
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete schedule #${scheduleId}?\n\nSchedules linked to existing bookings cannot be deleted.`
        );

        if (!confirmed) return;

        clearMessage(scheduleListMessage);

        try {
            button.disabled = true;
            button.textContent = "Deleting...";

            const response = await apiRequest(
                `/schedules/${scheduleId}`,
                {
                    method: "DELETE"
                }
            );

            showMessage(
                scheduleListMessage,
                response.message || "Schedule deleted successfully.",
                "success"
            );

            await loadScheduleList();

            // Refresh the booking schedule information if a date is selected.
            if (labSelect.value && requestedDate.value) {
                await loadSchedulesForSelectedDate();
            }

        } catch (error) {
            showMessage(
                scheduleListMessage,
                error.message || "Unable to delete this schedule.",
                "error"
            );

            await loadScheduleList();
        }
    }

    
async function loadBookedDates() {
    if (!labSelect.value) {
        resetBookingFields();
        return;
    }

    requestedDate.disabled = false;
    requestedDate.min = getToday();

    startTime.disabled = false;
    endTime.disabled = false;

    try {
        const response = await apiRequest(
            `/bookings/booked-dates?lab_id=${encodeURIComponent(labSelect.value)}`
        );

        if (!response.success) {
            throw new Error("Failed to load booked dates.");
        }

        const bookedDates = response.data.map(item => {
    if (typeof item.requested_date === "string") {
        return item.requested_date.slice(0, 10);
    }

    const date = new Date(item.requested_date);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
});

        requestedDate.dataset.bookedDates = JSON.stringify(bookedDates);

        console.log("Booked dates:", bookedDates);

    } catch (error) {
        console.error("Error loading booked dates:", error);
        showMessage(
            formMessage,
            "Unable to retrieve booked dates. Please try again.",
            "error"
        );
    }
}


    // DISPLAY SCHEDULES FOR REFERENCE
    
async function loadSchedulesForSelectedDate() {
    const labId = Number(labSelect.value);
    const selectedDate = requestedDate.value;

    if (!scheduleDisplay) return;

    if (!labId || !selectedDate) {
        scheduleDisplay.textContent =
            "Select a laboratory and date to view its schedules.";
        return;
    }

    scheduleDisplay.textContent = "Loading schedules...";

    try {
        // Load laboratory schedules
        const scheduleResponse = await apiRequest("/schedules");
        const schedules = scheduleResponse.data || [];

        // Find schedules for the selected laboratory and date
        const matchingSchedules = schedules.filter(schedule =>
            Number(schedule.lab_id) === labId &&
            getDate(schedule.schedule_date) === selectedDate &&
            isScheduleAvailable(schedule)
        );

        // Load booked dates
        const bookingResponse = await apiRequest(
            `/bookings/booked-dates?lab_id=${labId}`
        );

        const bookedDates = (bookingResponse.data || []).map(item =>
            typeof item.requested_date === "string"
                ? item.requested_date.slice(0, 10)
                : new Date(item.requested_date).toISOString().slice(0, 10)
        );

        const hasExistingBookings = bookedDates.includes(selectedDate);

        // Update optional schedule dropdown
        const scheduleSelect = document.getElementById("scheduleSelect");

        if (scheduleSelect) {
            scheduleSelect.innerHTML =
                '<option value="">No specific schedule</option>';

            matchingSchedules.forEach(schedule => {
                const option = document.createElement("option");
                option.value = schedule.schedule_id;
                option.textContent =
                    `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;

                scheduleSelect.appendChild(option);
            });
        }

        // Clear previous information
        scheduleDisplay.innerHTML = "";

        // Display existing booking information
        const bookingNotice = document.createElement("p");

        if (hasExistingBookings) {
            bookingNotice.textContent =
                "This date already has Pending or Approved bookings. You may still request another time, provided it does not overlap.";
        } else {
            bookingNotice.textContent =
                "No Pending or Approved bookings currently exist for this date.";
        }

        bookingNotice.style.fontWeight = "bold";
        scheduleDisplay.appendChild(bookingNotice);

        // Display available schedules
        if (!matchingSchedules.length) {
            const message = document.createElement("p");

            message.textContent =
                "No available laboratory schedules exist for this date. Your booking will be submitted for Admin review if there are no time conflicts.";

            scheduleDisplay.appendChild(message);
            return;
        }

        const heading = document.createElement("p");
        heading.textContent = "Available laboratory schedules:";
        heading.style.fontWeight = "bold";

        scheduleDisplay.appendChild(heading);

        const list = document.createElement("ul");

        matchingSchedules.forEach(schedule => {
            const item = document.createElement("li");

            item.textContent =
                `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;

            list.appendChild(item);
        });

        scheduleDisplay.appendChild(list);

        const note = document.createElement("small");

        note.textContent =
            "Schedules are shown for reference. Your booking status will be determined automatically based on the requested time.";

        scheduleDisplay.appendChild(note);

    } catch (error) {
        scheduleDisplay.textContent =
            "Unable to load schedule information. You may still submit your booking.";

        console.error("Schedule loading error:", error);
    }
}


    function validateSelectedDate() {
        const selectedDate = requestedDate.value;

        if (!selectedDate) return false;

        if (selectedDate < getToday()) {
            showMessage(
                formMessage,
                "You cannot select a date in the past.",
                "error"
            );

            requestedDate.value = "";
            return false;
        }

        return true;
    }

    // OPTIONAL SCHEDULE CREATION
    async function createSchedule(event) {
        event.preventDefault();
        clearMessage(scheduleMessage);

        if (
            !currentUser ||
            !["admin", "laboratory staff"].includes(
                String(currentUser.role || "").toLowerCase()
            )
        ) {
            showMessage(
                scheduleMessage,
                "You are not authorized to create schedules.",
                "error"
            );
            return;
        }

        const labId = Number(scheduleLab.value);
        const date = scheduleDate.value;
        const start = scheduleStart.value;
        const end = scheduleEnd.value;

        if (!labId || !date || !start || !end) {
            showMessage(
                scheduleMessage,
                "Please complete all schedule fields.",
                "error"
            );
            return;
        }

        if (start >= end) {
            showMessage(
                scheduleMessage,
                "End time must be later than start time.",
                "error"
            );
            return;
        }

        try {
            createScheduleButton.disabled = true;
            createScheduleButton.textContent = "Creating Schedule...";

            const response = await apiRequest("/schedules", {
                method: "POST",
                body: JSON.stringify({
                    lab_id: labId,
                    schedule_date: date,
                    start_time: start,
                    end_time: end
                })
            });

            showMessage(
                scheduleMessage,
                response.message || "Schedule created successfully.",
                "success"
            );

            scheduleForm.reset();
            await loadScheduleList();

            if (
                Number(labSelect.value) === labId &&
                requestedDate.value === date
            ) {
                await loadSchedulesForSelectedDate();
            }

        } catch (error) {
            showMessage(scheduleMessage, error.message, "error");
        } finally {
            createScheduleButton.disabled = false;
            createScheduleButton.textContent = "Create Laboratory Schedule";
        }
    }

    // ADMIN BOOKING STATUS CONTROLS
    async function updateBookingStatus(bookingId, statusId, button) {
        const statusName = statusId === STATUS_APPROVED
            ? "Approved"
            : "Rejected";

        const confirmed = confirm(
            `Are you sure you want to change booking #${bookingId} to ${statusName}?`
        );

        if (!confirmed) return;

        try {
            button.disabled = true;
            button.textContent = "Updating...";

            const response = await apiRequest(
                `/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        status_id: statusId
                    })
                }
            );

            showMessage(
                bookingMessage,
                response.message || `Booking #${bookingId} updated to ${statusName}.`,
                "success"
            );

            await loadBookings();

        } catch (error) {
            showMessage(
                bookingMessage,
                error.message || "Unable to update booking status.",
                "error"
            );

            await loadBookings();
        }
    }

    function createActionButton(label, statusId, bookingId) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;
        button.style.margin = "3px";
        button.style.padding = "8px 12px";

        if (statusId === STATUS_REJECTED) {
            button.style.background = "#b94a48";
        } else {
            button.style.background = "#39845a";
        }

        button.addEventListener("click", () => {
            updateBookingStatus(bookingId, statusId, button);
        });

        return button;
    }

    // LOAD BOOKING RECORDS
    async function loadBookings() {
        try {
            const response = await apiRequest("/bookings");
            const bookings = response.data || [];

            bookingTableBody.innerHTML = "";

            if (!bookings.length) {
                bookingTableBody.innerHTML = `
                    <tr>
                        <td colspan="${isAdmin() ? 8 : 7}" class="empty">
                            No booking records found.
                        </td>
                    </tr>
                `;
                return;
            }

            bookings.forEach(booking => {
                const row = document.createElement("tr");

                const values = [
                    booking.booking_id,
                    booking.lab_name || "—",
                    booking.requester_name || booking.requester_email || "—",
                    formatDate(booking.requested_date),
                    `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`,
                    booking.purpose || "—"
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                const statusCell = document.createElement("td");
                const badge = document.createElement("span");
                const status = booking.status_name || "Pending";

                badge.className = `status ${getStatusClass(status)}`;
                badge.textContent = status;

                statusCell.appendChild(badge);
                row.appendChild(statusCell);

                if (isAdmin()) {
                    const actionCell = document.createElement("td");
                    const normalizedStatus = String(status).toLowerCase();

                    if (normalizedStatus === "pending") {
                        actionCell.appendChild(
                            createActionButton(
                                "Approve",
                                STATUS_APPROVED,
                                booking.booking_id
                            )
                        );

                        actionCell.appendChild(
                            createActionButton(
                                "Reject",
                                STATUS_REJECTED,
                                booking.booking_id
                            )
                        );

                    } else if (normalizedStatus === "approved") {
                        actionCell.appendChild(
                            createActionButton(
                                "Reject",
                                STATUS_REJECTED,
                                booking.booking_id
                            )
                        );

                    } else if (normalizedStatus === "rejected") {
                        actionCell.appendChild(
                            createActionButton(
                                "Approve",
                                STATUS_APPROVED,
                                booking.booking_id
                            )
                        );
                    }

                    row.appendChild(actionCell);
                }

                bookingTableBody.appendChild(row);
            });

        } catch (error) {
            bookingTableBody.innerHTML = `
                <tr>
                    <td colspan="${isAdmin() ? 8 : 7}" class="empty">
                        Unable to load booking records.
                    </td>
                </tr>
            `;

            showMessage(bookingMessage, error.message, "error");
        }
    }

    // LABORATORY SELECTION
    labSelect.addEventListener("change", async () => {
        clearMessage(formMessage);
        resetBookingFields();
        await loadBookedDates();
    });

    // DATE SELECTION
    requestedDate.addEventListener("change", async () => {
        clearMessage(formMessage);

        if (!validateSelectedDate()) {
            if (scheduleDisplay) {
                scheduleDisplay.textContent =
                    "Select a valid date to view schedules.";
            }
            return;
        }

        await loadSchedulesForSelectedDate();
    });

    // SCHEDULE MANAGEMENT FORM
    scheduleForm.addEventListener("submit", createSchedule);

    // BOOKING FORM SUBMISSION
    bookingForm.addEventListener("submit", async event => {
        event.preventDefault();
        clearMessage(formMessage);

        const labId = Number(labSelect.value);
        const bookingDate = requestedDate.value;
        const bookingStart = startTime.value;
        const bookingEnd = endTime.value;
        const bookingPurpose = purpose.value.trim();

        if (!labId) {
            showMessage(
                formMessage,
                "Please select a laboratory.",
                "error"
            );
            return;
        }

        if (!validateSelectedDate()) {
            return;
        }

        if (!bookingStart || !bookingEnd || bookingStart >= bookingEnd) {
            showMessage(
                formMessage,
                "Please enter a valid start and end time. End time must be later than start time.",
                "error"
            );
            return;
        }

        if (!bookingPurpose) {
            showMessage(
                formMessage,
                "Please enter the purpose of your booking.",
                "error"
            );
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            const response = await apiRequest("/bookings", {
                method: "POST",
                body: JSON.stringify({
                    lab_id: labId,
                    requested_date: bookingDate,
                    start_time: bookingStart,
                    end_time: bookingEnd,
                    purpose: bookingPurpose
                })
            });

            const result = response.data || {};

            const status = result.status || "Pending";
            const message = result.message ||
                "Booking request submitted successfully.";

            showMessage(
                formMessage,
                `${message} Booking status: ${status}.`,
                status.toLowerCase() === "rejected" ? "error" : "success"
            );

            bookingForm.reset();
            resetBookingFields();

            await loadBookedDates();
            await loadBookings();

        } catch (error) {
            showMessage(formMessage, error.message, "error");

            await loadBookedDates();
            await loadBookings();

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Booking Request";
        }
    });
// SIGN OUT
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            logoutButton.disabled = true;
            logoutButton.textContent = "Signing out...";

            await apiRequest("/auth/logout", {
                method: "POST"
            });

            window.location.href = "login.html";

        } catch (error) {
            console.error("Logout error:", error);

            showMessage(
                pageMessage,
                error.message || "Unable to sign out. Please try again.",
                "error"
            );

            logoutButton.disabled = false;
            logoutButton.textContent = "Sign Out";
        }
    });
}

    // INITIALIZE PAGE
    async function initializePage() {
        try {
            await loadCurrentUser();
            await loadLaboratories();

            requestedDate.min = getToday();
            requestedDate.disabled = true;
            startTime.disabled = true;
            endTime.disabled = true;

            await loadScheduleList();
            await loadBookings();

        } catch (error) {
            showMessage(
                pageMessage,
                error.message || "Unable to initialize the booking page.",
                "error"
            );
        }
    }

    initializePage();
});
