// wwwroot/js/site.js

$(document).ready(function () {
    // Load all subjects on page load
    loadSubjects();

    // Search functionality
    $("#searchButton").click(function () {
        const searchTerm = $("#searchInput").val();
        loadSubjects(searchTerm);
    });

    // Allow search on enter key
    $("#searchInput").on("keyup", function (e) {
        if (e.key === "Enter") {
            const searchTerm = $(this).val();
            loadSubjects(searchTerm);
        }
    });

    // Handle subject click to load subtopics
    $(document).on("click", ".subject-item", function () {
        const subjectId = $(this).data("id");
        const subjectName = $(this).find(".subject-name").text();

        // Update active state
        $(".subject-item").removeClass("active");
        $(this).addClass("active");

        // Update title
        $("#selectedSubjectTitle").text("Subtopics for: " + subjectName);

        // Load subtopics
        loadSubtopics(subjectId);
    });

    // Add new subtopic field
    $("#addSubtopicField").click(function () {
        const newSubtopicField = `
            <div class="input-group mb-2">
                <input type="text" class="form-control subtopic-input" placeholder="Subtopic name" required>
                <div class="input-group-append">
                    <button class="btn btn-outline-danger remove-subtopic" type="button">Remove</button>
                </div>
            </div>
        `;
        $("#subtopicsContainer").append(newSubtopicField);
    });

    // Remove subtopic field
    $(document).on("click", ".remove-subtopic", function () {
        // Only remove if there's more than one subtopic field
        if ($("#subtopicsContainer .input-group").length > 1) {
            $(this).closest(".input-group").remove();
        } else {
            // Just clear the field instead of removing it
            $(this).closest(".input-group").find("input").val("");
        }
    });

    // Save new data
    $("#saveDataBtn").click(function () {
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Get subject name
        const subjectName = $("#subjectName").val();

        // Get subtopics
        const subtopicNames = [];
        $(".subtopic-input").each(function () {
            const name = $(this).val().trim();
            if (name !== "") {
                subtopicNames.push(name);
            }
        });

        // Create data object
        const data = {
            SubjectName: subjectName,
            SubtopicNames: subtopicNames
        };

        // Send to server
        $.ajax({
            url: "/Subjects/AddSubject",  // If using a controller
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                SubjectName: $("#subjectName").val(),
                SubtopicNames: $(".subtopic-input").map(function () {
                    return $(this).val();
                }).get()
            }),
            success: function (response) {
                if (response.success) {
                    alert("Data saved successfully!");
                    location.reload();
                } else {
                    alert("Server error: " + response.message);
                    console.error("Server error:", response);
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", xhr.responseText);
                alert("Server error: " + xhr.responseText);
            }
        });

    });

    ////
    $(document).on("click", ".edit-subject", function () {
        const subjectId = $(this).data("id");
        const subjectName = $(this).data("name");

        $("#editSubjectId").val(subjectId);
        $("#editSubjectName").val(subjectName);

        $("#editSubjectModal").modal("show");
    });

    $("#saveEditSubject").click(function () {
        const subjectId = $("#editSubjectId").val();
        const subjectName = $("#editSubjectName").val().trim();

        if (subjectName === "") {
            alert("Subject name cannot be empty!");
            return;
        }

        $.ajax({
            url: "/Subjects/EditSubject",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ Id: subjectId, Name: subjectName }),
            success: function (response) {
                if (response.success) {
                    $("#editSubjectModal").modal("hide");
                    loadSubjects();
                    alert("Subject updated successfully!");
                } else {
                    alert(response.message || "Error updating subject. Please try again.");
                }
            },
            error: function (xhr) {
                console.error("Error updating subject:", xhr);
                alert("Server error. Please try again.");
            }
        });
    });



    /////

    $(document).on("click", ".delete-subject", function () {
        const subjectId = $(this).data("id");

        if (!confirm("Are you sure you want to delete this subject?")) {
            return;
        }

        $.ajax({
            url: "/Subjects/DeleteSubject",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ Id: subjectId }),
            success: function (response) {
                if (response.success) {
                    loadSubjects();
                    alert("Subject deleted successfully!");
                } else {
                    alert(response.message || "Error deleting subject. Please try again.");
                }
            },
            error: function (xhr) {
                console.error("Error deleting subject:", xhr);
                alert("Server error. Please try again.");
            }
        });
    });






    // Reset form when modal is closed
    $("#addDataModal").on("hidden.bs.modal", function () {
        resetForm();
    });
});

// Function to load subjects from controller
function loadSubjects(searchTerm = "") {
    $.ajax({
        url: "/Subjects/GetSubjects",
        type: "GET",
        data: { searchTerm: searchTerm },
        success: function (subjects) {
            const subjectsListHtml = subjects.map(function (subject) {
                return `
                    <div class="list-group-item d-flex justify-content-between align-items-center subject-item" data-id="${subject.Id}">
                        <div>
                            <span class="subject-id">${subject.Id}</span>
                            <span class="subject-name">${subject.Name}</span>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm edit-subject" data-id="${subject.Id}" data-name="${subject.Name}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-subject" data-id="${subject.Id}">Delete</button>
                        </div>
                    </div>
                `;
            }).join("");

            $("#subjectsList").html(subjects.length > 0 ? subjectsListHtml :
                `<p class="text-center text-muted">No subjects found${searchTerm ? " for '" + searchTerm + "'" : ""}</p>`);
        },
        error: function (xhr) {
            console.error("Error loading subjects:", xhr);
            $("#subjectsList").html(`<p class="text-center text-danger">Error loading subjects. Please try again.</p>`);
        }
    });
}


// Function to load subtopics for a specific subject
function loadSubtopics(subjectId) {
    $.ajax({
        url: "/Subjects/GetSubtopics",
        type: "GET",
        data: { subjectId: subjectId },
        success: function (subtopics) {
            if (subtopics.length > 0) {
                const subtopicsListHtml = subtopics.map(function (subtopic) {
                    return `<div class="subtopic-item">${subtopic.Name}</div>`;
                }).join("");

                $("#subtopicsList").html(subtopicsListHtml);
            } else {
                $("#subtopicsList").html(`<p class="text-center text-muted">No subtopics found for this subject</p>`);
            }
        },
        error: function (xhr) {
            console.error("Error loading subtopics:", xhr);
            $("#subtopicsList").html(`<p class="text-center text-danger">Error loading subtopics. Please try again.</p>`);
        }
    });
}

// Function to validate the form
function validateForm() {
    // Check if subject name is provided
    if ($("#subjectName").val().trim() === "") {
        alert("Subject name is required!");
        return false;
    }

    // Check if at least one subtopic is provided
    let hasSubtopic = false;
    $(".subtopic-input").each(function () {
        if ($(this).val().trim() !== "") {
            hasSubtopic = true;
            return false; // break the loop
        }
    });

    if (!hasSubtopic) {
        alert("At least one subtopic is required!");
        return false;
    }

    return true;
}

// Function to reset the form
function resetForm() {
    $("#subjectName").val("");

    // Keep only one empty subtopic field
    $("#subtopicsContainer").html(`
        <div class="input-group mb-2">
            <input type="text" class="form-control subtopic-input" placeholder="Subtopic name" required>
            <div class="input-group-append">
                <button class="btn btn-outline-danger remove-subtopic" type="button">Remove</button>
            </div>
        </div>
    `);
}