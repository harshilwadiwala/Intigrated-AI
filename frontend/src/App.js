import React, { useState, useEffect, useRef } from "react"; 
import "./App.css";
import { FaGripLines } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import { IoSettingsSharp } from "react-icons/io5";
import { BsSendFill } from "react-icons/bs";
import { RiCheckboxBlankFill } from "react-icons/ri";
import { FaDownload } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";


import roboLogo from "./assets/robo-logo.jpg";
import imaginate from "./assets/imaginateLogo.png";
const App = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const chatHistory = activeChat ? activeChat.history : [];
  const messagesEndRef = useRef(null); 
 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]); // Keep this dependency on chatHistory

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [isSidebarOpen]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const handleCopyImage = async (url) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      await navigator.clipboard.write([
        new window.ClipboardItem({ [blob.type]: blob }),
      ]);
      alert("Image copied to clipboard!");
    } catch (err) {
      alert("Failed to copy image.");
    }
  };

  // Add this function inside your App component
  const handleImageDownload = async (url, filename = "generated-image.jpg") => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Failed to download image.");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startNewChat = () => {
    const newChatId =
      chats.length > 0 ? Math.max(...chats.map((c) => c.id)) + 1 : 1;
    const newChat = { id: newChatId, name: "New Chat", history: [] };
    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatId(newChatId);
  };

  const sendMessage = async () => {
    if ((!userInput.trim() && !uploadedImage) || isLoading) {
      return;
    }
    setLoading(true);

    const currentInput = userInput.trim();

    let currentActiveChatId = activeChatId;
    let currentChats = [...chats];

    // If there is no active chat, create one now and update the local variables
    if (!currentActiveChatId) {
      const newChatId =
        currentChats.length > 0
          ? Math.max(...currentChats.map((c) => c.id)) + 1
          : 1;
      const newChat = { id: newChatId, name: "New Chat", history: [] };

      currentChats = [newChat, ...currentChats];
      currentActiveChatId = newChatId;

      // Immediately update the state to reflect the new chat
      setChats(currentChats);
      setActiveChatId(currentActiveChatId);
    }

    // Find the active chat using the updated local variable
    const currentActiveChat = currentChats.find(
      (chat) => chat.id === currentActiveChatId
    );
    let updatedHistory = currentActiveChat
      ? [...currentActiveChat.history]
      : [];

    // Add user message
    if (currentInput) {
      updatedHistory.push({ role: "user", content: currentInput });
    }
    if (uploadedImage) {
      const imageUrl = URL.createObjectURL(uploadedImage);
      updatedHistory.push({
        role: "user",
        type: "image",
        content: imageUrl,
      });
    }

    // Update the chat's name if it's the first message and not yet named
    if (currentActiveChat.name === "New Chat" && currentInput) {
      currentChats = currentChats.map((chat) =>
        chat.id === currentActiveChatId
          ? { ...chat, name: currentInput.substring(0, 20) + "..." }
          : chat
      );
      setChats(currentChats);
    }

    // This is the crucial part: update the state with the user's message
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentActiveChatId
          ? { ...chat, history: updatedHistory }
          : chat
      )
    );

    setUserInput("");
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    const nameInquiry = currentInput.toLowerCase().includes("what is your name") ||
                         currentInput.toLowerCase().includes("what's your name");

    if (nameInquiry) {
    const botResponse = { 
  text: `Hello! I am  Imaginate AI , a versatile and powerful language model. 🧠

I was conceptualized and brought to life by  Harshil Wadiwala as a dedicated project to demonstrate the capabilities of modern generative AI. You can think of me as your custom assistant, trained to handle text queries, process images, and generate creative images upon request. My primary purpose is to be a helpful and reliable AI companion.` 
};
      
      // Add the bot's hardcoded response to the history
      setChats((prevChats) => {
        const chatToUpdate = prevChats.find(
          (chat) => chat.id === currentActiveChatId
        ) || { history: [] };
        const newHistoryWithBotResponse = [
          ...chatToUpdate.history,
          { role: "bot", ...botResponse },
        ];
        return prevChats.map((chat) =>
          chat.id === currentActiveChatId
            ? { ...chat, history: newHistoryWithBotResponse }
            : chat
        );
      });

      // Clear input and stop loading
      setLoading(false);
      return; // Crucially, exit the function
    }
    try {
      let response, data;
      const isImageRequest =
        currentInput.toLowerCase().includes("create an image") ||
        currentInput.toLowerCase().includes("generate an image") ||
        currentInput.toLowerCase().includes("generate image") ||
        currentInput.toLowerCase().includes("create image");

      if (uploadedImage) {
        const formData = new FormData();
        formData.append("file", uploadedImage);
        formData.append("prompt", currentInput);
        response = await fetch("http://localhost:5000/image-chat", {
          method: "POST",
          body: formData,
        });
      } else if (isImageRequest) {
        response = await fetch("http://localhost:5000/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: currentInput }),
        });
      } else {
        response = await fetch("http://localhost:5000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: currentInput }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}, Detail: ${
            errorData.error || response.statusText
          }`
        );
      }

      data = await response.json();
      let botResponse;

      if (isImageRequest && data.success && data.imageUrl) {
        botResponse = { type: "image", content: data.imageUrl };
      } else {
        botResponse = { text: data.response };
      }

      // Add the bot's response to the history and update the state again
      setChats((prevChats) => {
        const chatToUpdate = prevChats.find(
          (chat) => chat.id === currentActiveChatId
        ) || { history: [] };
        const newHistoryWithBotResponse = [
          ...chatToUpdate.history,
          { role: "bot", ...botResponse },
        ];
        return prevChats.map((chat) =>
          chat.id === currentActiveChatId
            ? { ...chat, history: newHistoryWithBotResponse }
            : chat
        );
      });
    } catch (error) {
      console.error("Error sending message to backend:", error);
      setChats((prevChats) => {
        const chatToUpdate = prevChats.find(
          (chat) => chat.id === currentActiveChatId
        ) || { history: [] };
        const newHistoryWithError = [
          ...chatToUpdate.history,
          { role: "bot", text: "Error: Could not get a response from AI." },
        ];
        return prevChats.map((chat) =>
          chat.id === currentActiveChatId
            ? { ...chat, history: newHistoryWithError }
            : chat
        );
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="Page-Container">
      <div
        className="sidebar-wrapper"
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="sidebar-trigger"></div>
        <div className="sidebar">
          <div className="menu-header">
            <span className="menu_icon">
              <FaGripLines />
            </span>
           
          </div>
          <li className="sidebar-item" onClick={startNewChat}>
            <div className="sidebar-item-content">
              <div className="icon" style={{ position: "relative", left: "-0.3em" }}>
                <FaPenToSquare />
              </div>
              <h3 className="sidebar-text">New Chat</h3>
            </div>
          </li>

          <div className="sidebar-scrollable-content">
            <ul>
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  className={`sidebar-item chat-history-item ${
                    chat.id === activeChatId ? "active" : ""
                  }`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="sidebar-item-content">
                    <h5 className="sidebar-text">{chat.name}</h5>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-footer">
            <li className="sidebar-item">
              <div className="sidebar-item-content">
                <div className="icon">
                  <IoSettingsSharp />
                </div>
                <h3 className="sidebar-text">Setting</h3>
              </div>
            </li>
          </div>
        </div>
      </div>
          <div className="app-header">
            <div className="logo">

        <img src={imaginate} alt="Logo" className="app-logo" />
        <h2 className="app-logo">Imaginate</h2>
            </div>
{/* <span className="app-title">Imaginate AI</span> */}
</div>
      <div className="App">
        <div className="chat-window">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.role === "bot" && (
                <div className="bot-row">
                  <img src={roboLogo} className="robo-logo" alt="Bot" />
                  <div className="bot-content">
                    {msg.type === "image" ? (
                      <>
                        <img
                          src={msg.content}
                          alt="Generated"
                          className="uploaded-image"
                        />
                        <div className="download_copy">
                          <button
                            className="download-btn"
                            style={{
                              marginTop: "8px",
                              color: "#7a3cff",
                              textDecoration: "underline",
                              fontSize: "1.4em",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              position: "relative",
                              right: "-18em",
                            }}
                            onClick={() => handleImageDownload(msg.content)}
                          >
                            <FaDownload />
                          </button>
                          
                        </div>
                      </>
                    ) : (
                      <p className="bot-response">{msg.text || msg.content}</p>
                    )}
                  </div>
                </div>
              )}
              {msg.role !== "bot" && (
                <>
                  {msg.type === "image" ? (
                    <img
                      src={msg.content}
                      alt="Uploaded"
                      className="uploaded-image"
                    />
                  ) : (
                    <p>{msg.content || msg.text}</p>
                  )}
                </>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="thinking-spinner">
                <span className="thinking-dot"></span>
                <span className="thinking-dot"></span>
                <span className="thinking-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> 
        </div>

        <div className="input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              uploadedImage
                ? `Image selected: ${uploadedImage.name}`
                : "Type your message or add an image or type generate/create image..."
            }
            disabled={isLoading}
            className="text-input"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <button
            onClick={triggerFileInput}
            disabled={isLoading}
            className="plus-button"
          >
            <FaPlus />
          </button>
          <button
            onClick={sendMessage}
            disabled={isLoading || (!userInput.trim() && !uploadedImage)}
            className="send-button"
          >
            {isLoading ? <RiCheckboxBlankFill /> : <BsSendFill />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
