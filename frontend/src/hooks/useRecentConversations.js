import { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { useStreamChat } from "../context/StreamChatContext";

const getOtherMember = (channel, currentUserId) => {
	const members = Object.values(channel.state.members || {});
	return members.find((m) => m.user?.id !== currentUserId)?.user;
};

const useRecentConversations = (limit = 6) => {
	const { client } = useStreamChat() || {};
	const currentUser = useRecoilValue(userAtom);
	const [conversations, setConversations] = useState([]);
	const [loading, setLoading] = useState(false);

	const refresh = useCallback(async () => {
		if (!client || !currentUser?._id) return;
		setLoading(true);
		try {
			const channels = await client.queryChannels(
				{ type: "messaging", members: { $in: [currentUser._id] } },
				{ last_message_at: -1 },
				{ limit, state: true, presence: true }
			);

			setConversations(
				channels.map((channel) => {
					const otherUser = getOtherMember(channel, currentUser._id);
					const lastMessage = channel.state.messages[channel.state.messages.length - 1];
					return {
						cid: channel.cid,
						username: otherUser?.name || otherUser?.id || "Unknown",
						userImage: otherUser?.image,
						lastMessageText: lastMessage?.text || "",
						unreadCount: channel.countUnread(),
					};
				})
			);
		} finally {
			setLoading(false);
		}
	}, [client, currentUser?._id, limit]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		if (!client) return;

		const handleEvent = (event) => {
			if (["message.new", "notification.message_new", "notification.mark_read", "message.read"].includes(event.type)) {
				refresh();
			}
		};

		client.on(handleEvent);
		return () => client.off(handleEvent);
	}, [client, refresh]);

	return { conversations, loading };
};

export default useRecentConversations;
