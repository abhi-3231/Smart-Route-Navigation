graph = {
    "Main Gate": {"Parking": 2, "Admin Block": 4},
    "Parking": {"Main Gate": 2, "Library": 3, "Cafeteria": 5},
    "Admin Block": {"Main Gate": 4, "Library": 2, "Auditorium": 6},

    "Library": {"Admin Block": 2, "Parking": 3, "Lab 1": 2, "Cafeteria": 2},
    "Cafeteria": {"Library": 2, "Parking": 5, "Hostel A": 4},

    "Lab 1": {"Library": 2, "Lab 2": 2},
    "Lab 2": {"Lab 1": 2, "Research Center": 3},
    "Research Center": {"Lab 2": 3, "Innovation Hub": 4},

    "Innovation Hub": {"Research Center": 4, "Auditorium": 3},
    "Auditorium": {"Admin Block": 6, "Innovation Hub": 3},

    "Hostel A": {"Cafeteria": 4, "Hostel B": 2},
    "Hostel B": {"Hostel A": 2, "Hostel C": 2},
    "Hostel C": {"Hostel B": 2, "Mess": 2},

    "Mess": {"Hostel C": 2, "Sports Complex": 4},

    "Sports Complex": {"Mess": 4, "Gym": 2, "Ground": 3},
    "Gym": {"Sports Complex": 2},
    "Ground": {"Sports Complex": 3, "Cricket Field": 2},

    "Cricket Field": {"Ground": 2, "Football Field": 2},
    "Football Field": {"Cricket Field": 2},

    "Medical Center": {"Admin Block": 3, "Hostel A": 5},
    "Bus Stop": {"Main Gate": 2, "Parking": 2},

    "IT Block": {"Library": 3, "Lab 1": 2},
    "ECE Block": {"Library": 3},
    "Mechanical Block": {"Parking": 4},

    "Open Air Theatre": {"Auditorium": 3, "Ground": 4}
}

coordinates = {
    "Main Gate": (50, 300),
    "Parking": (120, 260),
    "Bus Stop": (80, 200),

    "Admin Block": (200, 350),
    "Library": (300, 250),
    "Cafeteria": (400, 300),

    "Lab 1": (320, 180),
    "Lab 2": (400, 140),
    "Research Center": (500, 120),
    "Innovation Hub": (600, 150),

    "Auditorium": (500, 350),
    "Open Air Theatre": (600, 400),

    "IT Block": (250, 200),
    "ECE Block": (350, 200),
    "Mechanical Block": (150, 300),

    "Hostel A": (550, 300),
    "Hostel B": (650, 300),
    "Hostel C": (750, 300),
    "Mess": (750, 350),

    "Sports Complex": (850, 250),
    "Gym": (900, 200),
    "Ground": (850, 350),

    "Cricket Field": (950, 350),
    "Football Field": (1050, 350),

    "Medical Center": (400, 380)
}