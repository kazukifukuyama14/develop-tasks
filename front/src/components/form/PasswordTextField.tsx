import React, { useState } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
  type TextFieldProps,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

type PasswordTextFieldProps = Omit<TextFieldProps, "type">;

const PasswordTextField = React.forwardRef<
  HTMLInputElement,
  PasswordTextFieldProps
>(({ ...rest }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <TextField
      {...rest}
      type={showPassword ? "text" : "password"}
      inputRef={ref}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
                aria-label="パスワード表示切替"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
});

PasswordTextField.displayName = "PasswordTextField";

export default PasswordTextField;
