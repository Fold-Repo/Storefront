"use client";

import React, { useEffect } from "react";
import { useToast } from "@/hooks";

const InternetCheck: React.FC = () => {
	const { showSuccess, showError } = useToast();

	useEffect(() => {
		const handleOnlineEvent = () => showSuccess("Internet Restored 🚀");
		const handleOfflineEvent = () => showError("No/Bad Internet Connection 😭");

		window.addEventListener("online", handleOnlineEvent);
		window.addEventListener("offline", handleOfflineEvent);

		return () => {
			window.removeEventListener("online", handleOnlineEvent);
			window.removeEventListener("offline", handleOfflineEvent);
		};
	}, [showSuccess, showError]);

	return null;
};

export default InternetCheck;