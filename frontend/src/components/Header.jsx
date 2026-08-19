import {
	Box,
	Flex,
	Image,
	useColorMode,
	Link as ChakraLink,
	Button,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverArrow,
	PopoverBody,
	useDisclosure,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import useLogout from "../hooks/useLogout";
import useUnreadMessageCount from "../hooks/useUnreadMessageCount";
import ChatPreviewList from "./ChatPreviewList";

const Header = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const unreadCount = useUnreadMessageCount();
	const navigate = useNavigate();
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Flex justifyContent={"space-between"} mt={6} mb='12' alignItems={"center"}>
			{user && (
				<ChakraLink as={RouterLink} to='/' className='icon-container' display={"flex"}>
					<AiFillHome size={24} />
				</ChakraLink>
			)}
			{!user && (
				<ChakraLink as={RouterLink} to={"/auth"} onClick={() => {}}>
					Login
				</ChakraLink>
			)}

			<Image
				cursor={"pointer"}
				alt='logo'
				w={6}
				src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
				onClick={toggleColorMode}
			/>

			{user && (
				<Flex alignItems={"center"} gap={2}>
					<ChakraLink as={RouterLink} to={`/${user.username}`} className='icon-container' display={"flex"}>
						<RxAvatar size={24} />
					</ChakraLink>
					<Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement='bottom-end' isLazy>
						<PopoverTrigger>
							<Box className='icon-container' display={"flex"} position={"relative"} cursor={"pointer"}>
								<BsFillChatQuoteFill size={20} />
								{unreadCount > 0 && (
									<Box
										position={"absolute"}
										top={"-2px"}
										right={"-2px"}
										bg={"red.500"}
										color={"white"}
										borderRadius={"full"}
										fontSize={"10px"}
										fontWeight={"bold"}
										minW={"16px"}
										h={"16px"}
										px={unreadCount > 9 ? "3px" : 0}
										display={"flex"}
										alignItems={"center"}
										justifyContent={"center"}
										lineHeight={1}>
										{unreadCount > 99 ? "99+" : unreadCount}
									</Box>
								)}
							</Box>
						</PopoverTrigger>
						<PopoverContent w={"320px"} bg={"gray.dark"} borderColor={"gray.700"}>
							<PopoverArrow bg={"gray.dark"} />
							<PopoverBody p={0} maxH={"400px"} overflowY={"auto"}>
								<ChatPreviewList
									onSelect={(cid) => {
										onClose();
										navigate(`/chat?channel=${encodeURIComponent(cid)}`);
									}}
									onViewAll={() => {
										onClose();
										navigate("/chat");
									}}
								/>
							</PopoverBody>
						</PopoverContent>
					</Popover>
					<ChakraLink as={RouterLink} to={"/settings"} className='icon-container' display={"flex"}>
						<MdOutlineSettings size={20} />
					</ChakraLink>
					<Button size={"xs"} variant={"ghost"} onClick={logout} className='icon-container' h={"40px"} w={"40px"}>
						<FiLogOut size={20} />
					</Button>
				</Flex>
			)}

			{!user && (
				<ChakraLink as={RouterLink} to={"/auth"}>
					Sign up
				</ChakraLink>
			)}
		</Flex>
	);
};

export default Header;
