window.createOrderPDF = async function (data) {
    try {
        if (!window.pdfLib && !window.PDFLib) return;

        const pdfDoc = await PDFLib.PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);

        page.drawText("سفارش دل‌کیک 💗", {
            x: 200,
            y: 800,
            size: 18,
        });

        page.drawText(`نام: ${data.name}`, { x: 50, y: 750, size: 12 });
        page.drawText(`شماره: ${data.phone}`, { x: 50, y: 730, size: 12 });

        const bytes = await pdfDoc.save();

        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "dellcake.pdf";
        a.click();

        URL.revokeObjectURL(url);

    } catch (err) {
        console.error("PDF error:", err);
    }
};
