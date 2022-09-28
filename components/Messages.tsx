import { doc, FieldValue, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { auth, db } from "../firebase";
import { RootState } from "../store";
import Message from "./Message";

interface msgType {
  date: FieldValue;
  id: string;
  image?: string;
  senderId: string;
  text: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<msgType[]>([]);
  const chatId = useSelector((state: RootState) => state.chat.chatId);

  useEffect(() => {
    if (chatId) {
      const unsub = onSnapshot(doc(db, "messages", chatId), (snapshot) => {
        setMessages(snapshot.data()?.messages);
      });
      return () => {
        unsub();
      };
    }
  }, [db, chatId]);

  return (
    <div className="bg-[#ddddf7] h-[calc(100%-160px)] overflow-auto scrollbar-hide">
      {messages.map((message) => (
        <Message msg={message} key={message.id} />
      ))}
    </div>
  );
};

export default Messages;