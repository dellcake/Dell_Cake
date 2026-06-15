console.log("DellCake PDF Module Loaded 💗");

async function createOrderPDF(data) {

    const pdfDoc = await PDFLib.PDFDocument.create();

    const page = pdfDoc.addPage([595, 842]);

    page.drawText("DellCake Test PDF 💗", {
        x: 180,
        y: 750,
        size: 20
    });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob(
        [pdfBytes],
        { type: "application/pdf" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "dellcake-test.pdf";

    a.click();

    URL.revokeObjectURL(url);

}

window.testPDF = () => {

    createOrderPDF({});

};
