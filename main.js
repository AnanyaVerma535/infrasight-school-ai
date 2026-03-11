const Storage = {
    getReports() {
        return JSON.parse(localStorage.getItem('infrasight_reports') || '[]');
    },

    saveReports(reports) {
        localStorage.setItem('infrasight_reports', JSON.stringify(reports));
    },

    normalizeReport(report) {
        // Debugging log to see what the AI actually sent
        console.log("Normalizing Report. Category received from AI:", report.category);

        return {
            id: report.id || Date.now() + Math.floor(Math.random() * 1000),
            schoolName: report.schoolName || 'Unnamed School',
            location: report.location || 'Location not provided',
            description: report.description || 'No description provided.',
            fundAmount: report.fundAmount === null || report.fundAmount === undefined || report.fundAmount === '' ? null : Number(report.fundAmount),
            issueImg: report.issueImg || report.photo || report.beforeImg || report.afterImg || '',
            resolvedImage: report.resolvedImage || null,
            proofNotes: report.proofNotes || null, 
            status: report.status || 'pending',
            
            // If the AI fails, it will now say 'Unclassified' so you know there was an error in Python
            category: report.category || 'Unclassified', 
            
            timestamp: report.timestamp || new Date().toISOString(),
            submittedBy: report.submittedBy || 'Citizen Reporter'
        };
    },

    migrateReports() {
        const normalizedReports = Storage.getReports().map((report) => Storage.normalizeReport(report));
        Storage.saveReports(normalizedReports);
        return normalizedReports;
    },

    addReport(report) {
        const reports = Storage.migrateReports();
        reports.unshift(Storage.normalizeReport({
            ...report,
            id: Date.now(),
            status: 'pending',
            timestamp: new Date().toISOString()
        }));
        Storage.saveReports(reports);
    },

    updateReportStatus(id, newStatus) {
        const reports = Storage.migrateReports();
        const index = reports.findIndex((report) => String(report.id) === String(id));
        if (index !== -1) {
            reports[index].status = newStatus;
            Storage.saveReports(reports);
        }
    },

    verifyReportWithImage(id, resolvedImageBase64, proofNotes) {
        const reports = Storage.migrateReports();
        const index = reports.findIndex((report) => String(report.id) === String(id));
        if (index !== -1) {
            reports[index].status = 'verified';
            reports[index].resolvedImage = resolvedImageBase64;
            reports[index].proofNotes = proofNotes; 
            Storage.saveReports(reports);
        }
    },

    deleteReport(id) {
        const filtered = Storage.migrateReports().filter((report) => String(report.id) !== String(id));
        Storage.saveReports(filtered);
    }
};

const Auth = {
    login(role, userData) {
        sessionStorage.setItem('currentUser', JSON.stringify({ role, ...userData }));
        window.location.href = 'index.html';
    },

    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    },

    checkAuth() {
        const user = Auth.getCurrentUser();
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        if (!user && currentFile !== 'login.html') {
            window.location.href = 'login.html';
        }
        return user;
    }
};

const UI = {
    updateNavbar() {
        const user = Auth.getCurrentUser();
        const userBadge = document.getElementById('userBadge');
        const logoutBtn = document.getElementById('logout-btn');

        if (userBadge) {
            if (!user) {
                userBadge.textContent = 'HI';
                userBadge.title = 'Login';
            } else if (user.role === 'officer') {
                userBadge.textContent = 'OFF';
                userBadge.title = 'Officer account';
            } else {
                userBadge.textContent = (user.name || 'HI').trim().charAt(0).toUpperCase();
                userBadge.title = user.name || 'Citizen account';
            }
            userBadge.onclick = () => {
                if (user) {
                    window.location.href = user.role === 'officer' ? 'status.html' : 'report.html';
                } else {
                    window.location.href = 'login.html';
                }
            };
        }

        if (logoutBtn) {
            logoutBtn.style.display = user ? 'list-item' : 'none';
        }
    },

    formatCurrency(amount) {
        if (amount === null || amount === undefined || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
            return 'Not provided';
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Number(amount));
    },

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
};
function initSampleData() {
    if (Storage.getReports().length === 0) {
        const sampleReports = [
            {
                id: 1,
                schoolName: 'Govt Primary School Rampur',
                location: 'Rampur, Uttar Pradesh',
                description: 'Classroom roof has completely collapsed. Immediate danger to students.',
                fundAmount: 180000,
                // Valid JPG Image URL
                issueImg: 'https://c.ndtvimg.com/2022-07/s300t3b_mp-school-condition_625x300_27_July_22.jpg',
                status: 'pending',
                category: 'Worst', // Default WORST case
                submittedBy: 'Ravi Kumar',
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                schoolName: 'Girls Middle School Patna Rural',
                location: 'Patna, Bihar',
                description: 'Plaster is peeling off the walls and benches are broken.',
                fundAmount: 95000,
                // Valid Image URL
                issueImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzS9cgZgcQJEz1bSXoepRZ7N6letr82TuNsg&s',
                status: 'flagged',
                category: 'Bad', // Default BAD case
                submittedBy: 'Sunita Devi',
                timestamp: new Date().toISOString()
            },
            {
                id: 3,
                schoolName: 'ZP School Nandgaon',
                location: 'Nashik, Maharashtra',
                description: 'School is well maintained, just needs minor paint touch-ups.',
                fundAmount: 220000,
                // Valid Unsplash Image URL
                issueImg: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500',
                resolvedImage: 'https://5.imimg.com/data5/ANDROID/Default/2024/4/410263826/SX/WJ/GR/47642992/product-jpeg-500x500.jpg',
                proofNotes: 'Verified good condition.',
                status: 'verified',
                category: 'Good', // Default GOOD case
                submittedBy: 'Admin Officer',
                timestamp: new Date().toISOString()
            }
        ];
        Storage.saveReports(sampleReports.map((report) => Storage.normalizeReport(report)));
    }
}
function initSampleData() {
    if (Storage.getReports().length === 0) {
        const sampleReports = [
            {
                id: 1,
                schoolName: 'Govt Primary School Rampur',
                location: 'Rampur, Uttar Pradesh',
                description: 'Classroom roof is cracked and rainwater leaks during monsoon. Students are being shifted out during classes.',
                fundAmount: 180000,
                // FIXED: Changed from NDTV webpage URL to the actual JPG from that article so it renders correctly
                issueImg: 'https://c.ndtvimg.com/2022-07/v9gog3q8_students-hold-umbrellas_625x300_27_July_22.jpg?downsize=545:307',
                status: 'pending',
                category: 'Worst', // Sample AI category
                submittedBy: 'Ravi Kumar',
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                schoolName: 'Girls Middle School Patna Rural',
                location: 'Patna, Bihar',
                description: 'Toilet block is broken and unusable. The school building shows poor maintenance despite reported repair funds.',
                fundAmount: 95000,
                issueImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzS9cgZgcQJEz1bSXoepRZ7N6letr82TuNsg&s',
                status: 'flagged',
                category: 'Bad', // Sample AI category
                submittedBy: 'Sunita Devi',
                timestamp: new Date().toISOString()
            },
            {
                id: 3,
                schoolName: 'ZP School Nandgaon',
                location: 'Nashik, Maharashtra',
                description: 'Wall plaster has fallen off and electrical wiring is exposed in one of the learning rooms.',
                fundAmount: 220000,
                issueImg: 'https://thumbs.dreamstime.com/b/dilapidated-basement-room-peeling-plaster-exposed-pipes-large-wall-hole-damage-damaged-cracked-rust-stains-408167805.jpg',
                resolvedImage: 'https://5.imimg.com/data5/ANDROID/Default/2024/4/410263826/SX/WJ/GR/47642992/product-jpeg-500x500.jpg',
                proofNotes: 'The wall was completely re-plastered, repainted, and all electrical wirings have been concealed in PVC pipes ensuring safety.',
                status: 'verified',
                category: 'Good', // Sample AI category
                submittedBy: 'Admin Officer',
                timestamp: new Date().toISOString()
            }
        ];
        Storage.saveReports(sampleReports.map((report) => Storage.normalizeReport(report)));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSampleData();
    Storage.migrateReports();
    UI.updateNavbar();
});