import Button from "@mui/material/Button";
import styles from "@/styles/style.module.css";

const MButton = ({
                     type,
                     label,
                     variant,
                     color,
                     backgroundColor,
                     width,
                     size,
                     sx,
                     startIcon,
                     onClick,
                     display,
                     onChange,
                     ...props
                 }) => {
    return (
        <Button
            variant={variant}
            color={color}
            size={size}
            startIcon={startIcon}
            onClick={onClick}
            onChange={onChange}
            className={styles.customMaterialButton}
            sx={{
                backgroundColor: backgroundColor,
                lineHeight: '1',
                width: 'auto',
                height: '35px',
                '&:hover': {
                    backgroundColor: backgroundColor,
                    opacity: 0.8,
                    transition: "0.5s ease-in-out",
                    borderRadius: '5px',
                },
                ...sx,
                width: width,
            }}
            style={{
                borderRadius: '5px',
                display: display,
            }}
            {...props}
            type={type}
        >
            {label}
        </Button>
    );
};

export default MButton;
