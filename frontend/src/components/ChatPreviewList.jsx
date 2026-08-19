import { Avatar, Box, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import useRecentConversations from "../hooks/useRecentConversations";

const ChatPreviewList = ({ onSelect, onViewAll }) => {
	const { conversations, loading } = useRecentConversations();

	if (loading && conversations.length === 0) {
		return (
			<Flex justifyContent={"center"} p={4}>
				<Spinner size={"sm"} />
			</Flex>
		);
	}

	if (conversations.length === 0) {
		return (
			<Text p={4} fontSize={"sm"} color={"gray.light"} textAlign={"center"}>
				No conversations yet
			</Text>
		);
	}

	return (
		<Flex direction={"column"}>
			{conversations.map((conversation) => (
				<Flex
					key={conversation.cid}
					gap={3}
					p={3}
					alignItems={"center"}
					cursor={"pointer"}
					_hover={{ bg: "gray.700" }}
					onClick={() => onSelect(conversation.cid)}>
					<Avatar size={"sm"} name={conversation.username} src={conversation.userImage} />
					<Box flex={1} minW={0}>
						<Text fontSize={"sm"} fontWeight={conversation.unreadCount > 0 ? "bold" : "normal"} noOfLines={1}>
							{conversation.username}
						</Text>
						<Text fontSize={"xs"} color={"gray.light"} noOfLines={1}>
							{conversation.lastMessageText || "No messages yet"}
						</Text>
					</Box>
					{conversation.unreadCount > 0 && (
						<Box bg={"red.500"} color={"white"} borderRadius={"full"} fontSize={"10px"} fontWeight={"bold"} minW={"18px"} h={"18px"} px={"4px"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
							{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
						</Box>
					)}
				</Flex>
			))}
			<Divider />
			<Text p={3} fontSize={"sm"} textAlign={"center"} color={"blue.400"} cursor={"pointer"} _hover={{ textDecoration: "underline" }} onClick={onViewAll}>
				View all messages
			</Text>
		</Flex>
	);
};

export default ChatPreviewList;
