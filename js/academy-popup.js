document.addEventListener("DOMContentLoaded", () => {
    const academyPopupHtml = `
<div id="academyPopup" class="popup-overlay" onclick="if(event.target === this) closeAcademyPopup()">
  <div class="popup-box academy-popup-box">
    <button class="close-popup-btn" onclick="closeAcademyPopup()">&times;</button>
    <div class="academy-header">
        <h2>🎓 آکادمی تخصصی دل‌کیک</h2>
        <p>دنیای شیرین آموزش کیک و شیرینی‌پزی حرفه‌ای</p>
    </div>
    <div id="academy-courses-container" class="academy-courses-grid">
        <div class="academy-loader"></div>
    </div>
    <div class="academy-footer">
        <p>با شرکت در دوره‌های ما، هنر خود را به سطح حرفه‌ای برسانید.</p>
    </div>
  </div>
</div>
<style>
.academy-popup-box { max-width: 900px !important; width: 95% !important; max-height: 85vh; overflow-y: auto; padding: 30px !important; border-radius: 25px !important; position: relative; }
.close-popup-btn { position: absolute; top: 15px; left: 15px; background: #e8789a; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; z-index: 10; }
.academy-header { text-align: center; margin-bottom: 30px; }
.academy-header h2 { font-family: 'Lalezar', cursive; color: #6b3d2a; font-size: 2rem; margin-bottom: 10px; }
.academy-courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
.academy-course-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); transition: 0.3s; border: 1px solid #fdf6f0; }
.academy-course-card img { width: 100%; height: 160px; object-fit: cover; }
.course-info { padding: 15px; }
.course-info h3 { font-size: 1.1rem; color: #6b3d2a; margin-bottom: 8px; }
.course-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 10px; }
.course-footer .price { font-weight: bold; color: #e8789a; }
.buy-btn { background: #6b3d2a; color: white; text-decoration: none; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; }
.academy-loader { grid-column: 1/-1; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #e8789a; border-radius: 50%; animation: spin 1s linear infinite; margin: 40px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
`;
    document.body.insertAdjacentHTML('beforeend', academyPopupHtml);
    renderAcademyCourses();
});

async function renderAcademyCourses() {
    const coursesContainer = document.getElementById('academy-courses-container');
    if (!coursesContainer) return;

    try {
        const { db } = await import("./firebase-db.js");
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js");

        const q = query(collection(db, "courses"), where("status", "==", "published"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            coursesContainer.innerHTML = '<p class="no-courses">در حال حاضر دوره‌ای برای نمایش وجود ندارد.</p>';
            return;
        }

        let coursesHtml = '';
        snapshot.forEach(doc => {
            const course = doc.data();
            coursesHtml += `
                <div class="academy-course-card">
                    <img src="${course.image || 'images/placeholder-course.jpg'}" alt="${course.title}">
                    <div class="course-info">
                        <h3>${course.title}</h3>
                        <p>${course.description ? course.description.substring(0, 80) + '...' : ''}</p>
                        <div class="course-footer">
                            <span class="price">${Number(course.price).toLocaleString('fa-IR')} تومان</span>
                            <a href="user/login.html" class="buy-btn">مشاهده و ثبت‌نام</a>
                        </div>
                    </div>
                </div>
            `;
        });
        coursesContainer.innerHTML = coursesHtml;
    } catch (error) {
        console.error("Error loading academy courses:", error);
    }
}

window.openAcademyPopup = function() {
    const popup = document.getElementById("academyPopup");
    if (popup) {
        popup.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
};

window.closeAcademyPopup = function() {
    const popup = document.getElementById("academyPopup");
    if (popup) {
        popup.style.display = "none";
        document.body.style.overflow = "auto";
    }
};
