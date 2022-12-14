import React, { useEffect, useState } from "react";
import Input from "./Input";
import Messages from "./Messages";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import TimeAgo from "timeago-react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import {
  deleteDoc,
  deleteField,
  doc,
  DocumentData,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const Chat = () => {
  const [chat, setChat] = useState<DocumentData>();
  const [lastActive, setLastActive] = useState("");

  const friendName = useSelector(
    (state: RootState) => state.chat.friend.displayName
  );

  const friendUid = useSelector((state: RootState) => state.chat.friend.uid);

  const chatId = useSelector((state: RootState) => state.chat.chatId);

  const user = auth.currentUser;

  const deleteChat = async () => {
    const ok = confirm("Remove this friend?");

    if (ok) {
      await updateDoc(doc(db, "chats", user!.uid), {
        [chatId!]: deleteField(),
      });
      await updateDoc(doc(db, "chats", friendUid), {
        [chatId!]: deleteField(),
      });
      await deleteDoc(doc(db, "messages", chatId!));
    }
  };

  useEffect(() => {
    if (friendUid) {
      const unsub1 = onSnapshot(doc(db, "users", friendUid), (snapshot) => {
        setLastActive(snapshot.data()?.lastActive);
      });

      const unsub2 = onSnapshot(doc(db, "chats", user!.uid), (snapshot) => {
        setChat(snapshot.data()?.[chatId!]);
      });

      return () => {
        unsub1();
        unsub2();
      };
    }
  }, [db, friendUid, user?.uid]);

  return (
    <div className=" w-4/5 sm:w-2/3 bg-[#ddddf7]">
      {chat ? (
        <>
          <div className="bg-[#5d5b8d] text-gray-300 h-16 sm:h-20 flex items-center px-3">
            <div className="flex items-center w-full">
              <div className="flex-1">
                <h3 className="text-base sm:text-2xl italic">{friendName}</h3>

                <p className="text-xs font-light sm:text-sm">
                  Last active: <TimeAgo datetime={lastActive} />
                </p>
              </div>
              <button onClick={deleteChat} className="hover:text-white">
                <XCircleIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            </div>
          </div>
          <Messages />
          <Input />
        </>
      ) : (
        <div className="flex flex-col justify-center items-center h-full text-[#5d5b8d] font-bold text-lg sm:text-xl md:text-3xl">
          <p>Start a New Chat </p>
          <p>by Adding your Friends!</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
