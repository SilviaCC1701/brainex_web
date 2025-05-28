document.addEventListener("DOMContentLoaded", function () {
    const btnRegister = document.getElementById("btn_register");

    btnRegister.addEventListener("click", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("registerNombre").value;
        const nombreUsuario = document.getElementById("registerNombreUsuario").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        fetch("/Cuenta/Registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: nombre,
                usuario: nombreUsuario,
                email: email,
                contrasena: password,
                repetirContrasena: confirmPassword
            })
        })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    return response.json().then(data => {
                        alert(data.mensaje || "Registro fallido");
                    });
                }
            })
            .catch(error => {
                console.error("Error al registrar:", error);
                alert("Hubo un error al registrar.");
            });
    });

    const btnLogin = document.getElementById("btn_login");

    btnLogin.addEventListener("click", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        fetch("/Cuenta/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: email,
                contrasena: password
            })
        })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    return response.json().then(data => {
                        alert(data.mensaje || "Login incorrecto");
                    });
                }
            })
            .catch(error => {
                console.error("Error al iniciar sesión:", error);
                alert("Hubo un error al iniciar sesión.");
            });
    });
});
