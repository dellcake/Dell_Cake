import { ADMIN_CONFIG } from "./config.js";
import { db } from "../../js/firebase-db.js";
import { auth } from "../../js/firebase-auth.js";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// DOM Elements
const sections = {
    dashboard: document.getElementById('dashboard-section'),
    courses: document.getElementById('courses-section'),
    orders: document.getElementById('orders-section')
};
const pageTitle = document.getElementById('page-title');
const navItems = document.querySelectorAll('.sidebar-nav li');
const coursesTbody = document.getElementById('courses-tbody');
const ordersTbody = document.getElementById('orders-tbody');
const courseModal = document.getElementById('course-modal');
const courseForm = document.getElementById('course-form');

// State
let allCourses = [];

// Set Admin Email in UI
document.getElementById('admin-email').innerText = ADMIN_CONFIG.adminEmail;

// Navigation
window.navigateTo = (sectionId) => {
    Object.keys(sections).forEach(key => {
        sections[key].style.display = key === sectionId ? 'block' : 'none';
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(`'${sectionId}'`)) {
            item.classList.add('active');
        }
    });

    const titles = {
        dashboard: 'داشبورد',
        courses: 'مدیریت دوره‌ها',
        orders: 'مدیریت سفارشات'
    };
    pageTitle.innerText = titles[sectionId] || 'پنل مدیریت';
};

// Logout
window.logout = async () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        try {
            await signOut(auth);
            location.replace('login.html');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};

// Load Courses
const loadCourses = () => {
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    onSnapshot(q, (querySnapshot) => {
        allCourses = [];
        coursesTbody.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const course = { id: doc.id, ...doc.data() };
            allCourses.push(course);
            renderCourseRow(course);
        });
        document.getElementById('total-courses').innerText = allCourses.length;
    }, (error) => {
        console.error("Courses Snapshot Error:", error);
        // Fallback if index is missing
        const fallbackQuery = query(collection(db, "courses"));
        onSnapshot(fallbackQuery, (snapshot) => {
            allCourses = [];
            coursesTbody.innerHTML = '';
            snapshot.forEach((doc) => {
                const course = { id: doc.id, ...doc.data() };
                allCourses.push(course);
                renderCourseRow(course);
            });
            document.getElementById('total-courses').innerText = allCourses.length;
        });
    });
};

const renderCourseRow = (course) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><img src="${course.image || '../images/logo/sweet-.png'}" class="course-img-table"></td>
        <td>${course.title}</td>
        <td>${Number(course.price).toLocaleString()}</td>
        <td>${course.level}</td>
        <td>
            <div class="actions">
                <button class="btn-icon btn-edit" onclick="editCourse('${course.id}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteCourse('${course.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    coursesTbody.appendChild(tr);
};

// Load Orders
const loadOrders = () => {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));
    onSnapshot(q, (querySnapshot) => {
        ordersTbody.innerHTML = '';
        let newCount = 0;
        const activitiesList = document.getElementById('activities-list');
        activitiesList.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const order = { id: doc.id, ...doc.data() };
            renderOrderRow(order);
            if (order.status === 'pending' || order.status === 'جدید') newCount++;

            // Fill recent activities
            const activity = document.createElement('div');
            activity.className = 'activity-item';
            activity.innerHTML = `<p>سفارش جدید از <strong>${order.customerName || 'نامشخص'}</strong> - ${order.cakeType || 'کیک'}</p>`;
            activitiesList.appendChild(activity);
        });

        document.getElementById('new-orders').innerText = newCount;
        if (querySnapshot.empty) {
            activitiesList.innerHTML = '<p class="empty-msg">فعالیتی ثبت نشده است.</p>';
        }
    }, (error) => {
        console.error("Orders Snapshot Error:", error);
        // Fallback if index is missing
        onSnapshot(collection(db, "orders"), (snapshot) => {
            ordersTbody.innerHTML = '';
            snapshot.forEach((doc) => {
                renderOrderRow({ id: doc.id, ...doc.data() });
            });
        });
    });
};

const renderOrderRow = (order) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${order.customerName || 'نامشخص'}</td>
        <td>${order.cakeType || 'کیک'}</td>
        <td>${order.date || '---'}</td>
        <td><span class="status-badge ${order.status}">${order.status || 'ثبت شده'}</span></td>
        <td>
            <div class="actions">
                <button class="btn-icon btn-edit" onclick="updateOrderStatus('${order.id}')">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteOrder('${order.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    ordersTbody.appendChild(tr);
};

// Course Modal & CRUD
window.openCourseModal = (courseId = null) => {
    courseModal.style.display = 'block';
    if (courseId) {
        const course = allCourses.find(c => c.id === courseId);
        document.getElementById('modal-title').innerText = 'ویرایش دوره';
        document.getElementById('course-id').value = course.id;
        document.getElementById('course-title').value = course.title;
        document.getElementById('course-price').value = course.price;
        document.getElementById('course-level').value = course.level;
        document.getElementById('course-duration').value = course.duration || '';
        document.getElementById('course-description').value = course.description;
        document.getElementById('course-package').value = (course.package || []).join('\n');
        document.getElementById('course-image').value = course.image || '';
    } else {
        document.getElementById('modal-title').innerText = 'افزودن دوره جدید';
        courseForm.reset();
        document.getElementById('course-id').value = '';
    }
};

window.closeCourseModal = () => {
    courseModal.style.display = 'none';
};

courseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('course-id').value;
    const courseData = {
        title: document.getElementById('course-title').value,
        price: document.getElementById('course-price').value,
        level: document.getElementById('course-level').value,
        duration: document.getElementById('course-duration').value,
        description: document.getElementById('course-description').value,
        package: document.getElementById('course-package').value.split('\n').filter(item => item.trim() !== ''),
        image: document.getElementById('course-image').value,
        updatedAt: new Date()
    };

    try {
        if (id) {
            await updateDoc(doc(db, "courses", id), courseData);
            alert('دوره با موفقیت بروزرسانی شد.');
        } else {
            courseData.createdAt = new Date();
            await addDoc(collection(db, "courses"), courseData);
            alert('دوره جدید با موفقیت اضافه شد.');
        }
        closeCourseModal();
    } catch (error) {
        console.error("Error saving course:", error);
        alert('خطا در ذخیره اطلاعات!');
    }
});

window.editCourse = (id) => {
    window.openCourseModal(id);
};

window.deleteCourse = async (id) => {
    if (confirm('آیا از حذف این دوره مطمئن هستید؟')) {
        try {
            await deleteDoc(doc(db, "courses", id));
            alert('دوره حذف شد.');
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    }
};

window.updateOrderStatus = async (id) => {
    const newStatus = prompt('وضعیت جدید را وارد کنید (جدید، در حال آماده سازی، تکمیل شده، لغو شده):');
    if (newStatus) {
        try {
            await updateDoc(doc(db, "orders", id), { status: newStatus });
            alert('وضعیت سفارش بروزرسانی شد.');
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    }
};

window.deleteOrder = async (id) => {
    if (confirm('آیا از حذف این سفارش مطمئن هستید؟')) {
        try {
            await deleteDoc(doc(db, "orders", id));
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
    loadOrders();
});
