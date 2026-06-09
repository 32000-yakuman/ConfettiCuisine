"use strict"

$(document).ready(() => {    
    // クライアントサイドでのsocket.ioの初期化
    const socket = io()

    // 履歴を要求
    socket.emit("load messages")
    // フォーム送出時にイベントを発行
    $("#chatForm").submit(() =>{
        const text = $("#chat-input").val(),
            userName = $("#chat-user-name").val(),
            userId = $("#chat-user-id").val()
        socket.emit("message", {
            content: text,
            userName: userName,
            userId: userId
        })
        $("#chat-input").val("")
        return false
    })


    socket.on("load all messages", (data) => {
        data.forEach(message => {
            displayMessage(message)
        })
    })
    
    /*
    // 送信したメッセージをUIに反映
    socket.on("message", (message) => {
        displayMessage(message)
    })
    */

    // user disconnectedイベントの監視
    socket.on("user disconnected", () => {
        displayMessage({
            userName: "Notice",
            content: "User left the chat",
        })
    })

    // チャットに更新があったらアニメーションで知らせる
    socket.on("message", (message) => {
        displayMessage(message)
        for (let i=0; i<2; i++) {
            $(".chat-icon").fadeOut(200).fadeIn(200)
        }
    })

    // 受信したメッセージをチャットボックスに表示
    const displayMessage = (message) => {
        $("#chat").prepend(
            $("<li>").html(`
            <strong class="message 
            ${getCurrentUserClass(message.user)}">
            ${message.userName}
            </strong>: ${message.content}
        `))
    }
    

    const getCurrentUserClass = (id) => {
        const userId = $("#chat-user-id").val()
        return userId === id ? "current-user": "" 
    }
    
    // モーダルの動作
    $("#modal-button").on("click", async () => {
        
        console.log("=== Modal button clicked ===") //log1
        
        $(".modal-body").empty();
        
        try {
            console.log("Fetching /api/courses ...");  //log2
            const results = await $.ajax({
                url: "/api/courses",
                method: "GET"
            });

            const data = results.data;


            if (!data || !data.courses) {
                console.warn("No courses found");
                return;
            }

            for(const course of data.courses) {
                $(".modal-body").append(`
                    <div>
                        <span class="course-title">${course.title}</span>
                        <button class='button ${course.joined ? "joined-button" : "join-button"}' data-id="${course._id}">
                            ${course.joined ? "Joined" : "Join"}
                        </button>
                        <div class="course-description">${course.description}</div>
                    </div>
                `)
            }
            console.log("modal-body HTML:", $(".modal-body").html());
            addJoinButtonListener()
        } catch (err) {
            console.error("AJAX error:", err); 
        }
    });
    
    // フラッシュメッセージ
    const flashes = document.querySelector(".flashes");
    if (flashes && flashes.textContent.trim() !== "") {
        flashes.classList.add("show");
    }
})

const addJoinButtonListener = () => {
        $(document).on("click", ".join-button", async (event) => {
            console.log("=== join-button clicked ===");  // ★ここ

            const $button = $(event.target),
                courseId = $button.data("id")

                console.log("Calling join API with courseId:", courseId);  // ②

            try {
                const results = await $.get(`/api/courses/${courseId}/join`);


                console.log("join API results:", results);               // ③
                console.log("join API data:", results.data);
                
                if (results.data && results.data.success) {
                    $button
                        .text("joined")
                        .addClass("joined-button")
                        .removeClass("join-button")
                } else {
                    $button.text("try again")
                }
            } catch (err) {
                console.error("Join error", err)
                $button.text("error")
            }
        })
}
