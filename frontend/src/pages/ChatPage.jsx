import { Box, Button, Flex, Input, Spinner, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { useSearchParams } from "react-router-dom";
import {
	Chat,
	Channel,
	ChannelHeader,
	ChannelList,
	MessageComposer,
	MessageList,
	Thread,
	Window,
	useChatContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { useStreamChat } from "../context/StreamChatContext";
import { SearchIcon } from "@chakra-ui/icons";

const ChatPageInner = () => {
	const { client, channel: activeChannel, setActiveChannel } = useChatContext();
	const currentUser = useRecoilValue(userAtom);
	const [searchText, setSearchText] = useState("");
	const [searchingUser, setSearchingUser] = useState(false);
	const showToast = useShowToast();
	const [searchParams, setSearchParams] = useSearchParams();

	// Deep link from the header's conversation popover: /chat?channel=<cid>
	useEffect(() => {
		const cid = searchParams.get("channel");
		if (!cid) return;

		const [type, id] = cid.split(":");
		if (!type || !id) return;

		let isCancelled = false;
		const openChannel = async () => {
			try {
				const channel = client.channel(type, id);
				await channel.watch();
				if (!isCancelled) setActiveChannel(channel);
			} catch (error) {
				showToast("Error", error.message, "error");
			}
		};

		openChannel();
		setSearchParams({}, { replace: true });

		return () => {
			isCancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const handleConversationSearch = async (e) => {
		e.preventDefault();
		if (!searchText.trim()) return;
		setSearchingUser(true);
		try {
			const res = await fetch(`/api/users/profile/${searchText}`);
			const foundUser = await res.json();
			if (foundUser.error) {
				showToast("Error", foundUser.error, "error");
				return;
			}

			if (foundUser._id === currentUser._id) {
				showToast("Error", "You cannot message yourself", "error");
				return;
			}

			const channel = client.channel("messaging", { members: [currentUser._id, foundUser._id] });
			await channel.watch();
			setActiveChannel(channel);
			setSearchText("");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setSearchingUser(false);
		}
	};

	const filters = { type: "messaging", members: { $in: [currentUser._id] } };
	const sort = { last_message_at: -1 };
	const options = { state: true, presence: true, limit: 10 };

	return (
		<Box w={"full"} py={4}>
			<Flex gap={4} flexDirection={{ base: "column", md: "row" }} h={"75vh"}>
				<Flex flex={"0 0 auto"} w={{ base: "full", md: "290px" }} gap={2} flexDirection={"column"}>
					<Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
						Your Conversations
					</Text>
					<form onSubmit={handleConversationSearch}>
						<Flex alignItems={"center"} gap={2}>
							<Input placeholder='Search for a user' onChange={(e) => setSearchText(e.target.value)} value={searchText} />
							<Button type='submit' size={"sm"} isLoading={searchingUser}>
								<SearchIcon />
							</Button>
						</Flex>
					</form>

					<Box flex={1} overflowY={"auto"} overflowX={"hidden"}>
						<ChannelList filters={filters} sort={sort} options={options} />
					</Box>
				</Flex>

				<Box flex={1} minW={0} borderRadius={"md"} overflow={"hidden"}>
					{activeChannel ? (
						<Channel channel={activeChannel}>
							<Window>
								<ChannelHeader />
								<MessageList />
								<MessageComposer focus />
							</Window>
							<Thread />
						</Channel>
					) : (
						<Flex h={"full"} alignItems={"center"} justifyContent={"center"}>
							<Text fontSize={20}>Select a conversation to start messaging</Text>
						</Flex>
					)}
				</Box>
			</Flex>
		</Box>
	);
};

const ChatPage = () => {
	const { client } = useStreamChat();
	const { colorMode } = useColorMode();

	if (!client) {
		return (
			<Flex justifyContent={"center"} mt={20}>
				<Spinner size={"xl"} />
			</Flex>
		);
	}

	return (
		<Chat client={client} theme={colorMode === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"}>
			<ChatPageInner />
		</Chat>
	);
};

export default ChatPage;
