import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom.js";

const StreamChatContext = createContext();

export const useStreamChat = () => {
	return useContext(StreamChatContext);
};

// A single client instance for the whole app lifetime (StreamChat.getInstance
// already returns a singleton per API key).
const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

// React 18 StrictMode double-invokes effects on mount (mount -> cleanup ->
// mount again) before the first run's async work has settled. Without this
// guard, both invocations call connectUser() on the same client concurrently,
// which races and leaves channel state desynced between components. This
// caches the in-flight connect promise per user id so the second invocation
// just awaits the first one instead of starting a duplicate connection.
let pendingConnection = null;

const ensureStreamUserConnected = (user) => {
	if (chatClient.userID === user._id) return Promise.resolve(chatClient);
	if (pendingConnection?.userId === user._id) return pendingConnection.promise;

	const promise = (async () => {
		if (chatClient.userID) await chatClient.disconnectUser();

		const res = await fetch("/api/stream/token");
		const data = await res.json();
		if (data.error) throw new Error(data.error);

		await chatClient.connectUser(
			{
				id: user._id,
				name: user.username,
				image: user.profilePic || undefined,
			},
			data.token
		);

		return chatClient;
	})().finally(() => {
		pendingConnection = null;
	});

	pendingConnection = { userId: user._id, promise };
	return promise;
};

export const StreamChatContextProvider = ({ children }) => {
	const [client, setClient] = useState(null);
	const user = useRecoilValue(userAtom);

	useEffect(() => {
		if (!user?._id) {
			if (chatClient.userID) chatClient.disconnectUser();
			setClient(null);
			return;
		}

		let isCancelled = false;

		ensureStreamUserConnected(user)
			.then((connectedClient) => {
				if (!isCancelled) setClient(connectedClient);
			})
			.catch((error) => {
				console.error("Failed to connect to Stream Chat:", error.message);
			});

		return () => {
			isCancelled = true;
		};
	}, [user?._id]);

	return <StreamChatContext.Provider value={{ client }}>{children}</StreamChatContext.Provider>;
};
