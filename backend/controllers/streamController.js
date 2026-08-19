import { StreamChat } from "stream-chat";

// Instantiated lazily (not at import time) because this module can load
// before server.js runs dotenv.config(), which would leave the API secret
// undefined.
let streamClient;
const getStreamClient = () => {
	if (!streamClient) {
		streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
	}
	return streamClient;
};

// Stream Chat only lets you add a user as a channel member if that user
// already exists on Stream's side. We call this on signup/login so anyone
// can be messaged even before they've ever opened the chat page themselves.
const upsertStreamUser = async (user) => {
	await getStreamClient().upsertUser({
		id: user._id.toString(),
		name: user.username,
		image: user.profilePic || undefined,
	});
};

const getStreamToken = async (req, res) => {
	try {
		const user = req.user;

		await upsertStreamUser(user);

		const token = getStreamClient().createToken(user._id.toString());

		res.status(200).json({ token });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getStreamToken: ", err.message);
	}
};

export { getStreamToken, upsertStreamUser };
