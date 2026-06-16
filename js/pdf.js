function generateInvoicePDF(data) {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;

    // بک‌گراند فاکتور
    const bg = "/images/pdf/invoice-bg.jpg";
    const logo = "/images/logo/sweet-.png";

    doc.addImage(bg, "JPG", 0, 0, pageWidth, pageHeight);

    // لوگو
    doc.addImage(logo, "PNG", 150, 10, 40, 40);

    // تنظیم فونت پیش‌فرض (پیشنهاد: بعداً فونت فارسی اضافه کنیم)
    doc.setFont("helvetica", "normal");

    // عنوان
    doc.setFontSize(16);
    doc.text("پیش‌فاکتور دل‌کیک", 105, 25, { align: "center" });

    // اطلاعات مشتری
    doc.setFontSize(12);

    let y = 60;

    const line = (label, value) => {
        if (!value) return;
        doc.text(`${label}: ${value}`, 190, y, { align: "right" });
        y += 10;
    };

    line("نام مشتری", data.name);
    line("شماره تماس", data.phone);
    line("نوع کیک", data.type);
    line("وزن", data.weight + " کیلوگرم");
    line("تاریخ تحویل", data.date);
    line("ساعت تحویل", data.time);

    y += 10;

    doc.text("جزئیات سفارش:", 190, y, { align: "right" });
    y += 10;

    (data.details || []).forEach(item => {
        doc.text(`• ${item}`, 185, y, { align: "right" });
        y += 8;
    });

    // دانلود فایل
    doc.save(`DellCake-Invoice-${data.name}.pdf`);
}
