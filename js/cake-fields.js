document.addEventListener("DOMContentLoaded", () => {

    const cakeType = document.getElementById("cakeType");

    if (!cakeType) return;

    const sections = {
        birthday: "birthdayFields",
        kids: "kidsFields",
        engagement: "engagementFields",
        wedding: "weddingFields",
        custom: "customCakeFields"
    };

    cakeType.addEventListener("change", () => {

        Object.values(sections).forEach(id => {

            const section = document.getElementById(id);

            if (section) {
                section.style.display = "none";
            }

        });

        const selectedSection =
            document.getElementById(
                sections[cakeType.value]
            );

        if (selectedSection) {
            selectedSection.style.display = "block";
        }

    });

});
