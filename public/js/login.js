"use strict"
// ログインフォームの送信イベント
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const membershipNumber = document.getElementById("inputMembershipNumber").value;
    const password = document.getElementById("inputPassword").value;

    try {
        console.log("SEND PASSWORD:", password)
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ membershipNumber, password })
        });
        console.log("FETCH BODY:", {
            membershipNumber,
            password
        });


        const data = await res.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        // ★ JWT をcookie保存
        document.cookie = `token=${data.token}; path=/;`;

        // ★ ログイン後にトップへ
        window.location.href = "/";
    } catch (err) {
        console.error(err);
        alert("Login failed");
    }
});