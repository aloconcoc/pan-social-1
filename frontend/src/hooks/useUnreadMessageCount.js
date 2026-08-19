import { useEffect, useState } from "react";
import { useStreamChat } from "../context/StreamChatContext";

const useUnreadMessageCount = () => {
	const { client } = useStreamChat() || {};
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (!client) {
			setUnreadCount(0);
			return;
		}

		setUnreadCount(client.user?.total_unread_count || 0);

		const handleEvent = (event) => {
			if (typeof event.total_unread_count === "number") {
				setUnreadCount(event.total_unread_count);
			}
		};

		client.on(handleEvent);
		return () => client.off(handleEvent);
	}, [client]);

	return unreadCount;
};

export default useUnreadMessageCount;
