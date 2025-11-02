<ClickToCopy
  text={userProfile?.phone || ""}
  className="form-input bg-gray-700 flex items-center"
>
  <Mail className="w-4 h-4 text-gray-400 mr-3" />
  <span>{userProfile?.phone || "Not provided"}</span>
</ClickToCopy>;
