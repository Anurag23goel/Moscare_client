const generateRandomPassword = () => {
    const length = 12; // Length of the password
    const specialChars = "!@#$%^&*()";
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numericChars = "0123456789";

    // Ensure at least one character from each group
    const special = specialChars[Math.floor(Math.random() * specialChars.length)];
    const upper = upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
    const numeric = numericChars[Math.floor(Math.random() * numericChars.length)];
    const remainingLength = length - 3;

    // Fill the rest with a random selection of all groups
    const allChars = specialChars + upperCaseChars + lowerCaseChars + numericChars;
    let remainingChars = "";
    for (let i = 0; i < remainingLength; i++) {
        remainingChars += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the characters to randomize the position of the guaranteed characters
    const password = [special, upper, numeric, ...remainingChars].sort(() => Math.random() - 0.5).join("");

    return password;
};

const generateNamePassword = (name) => {
    const firstLetter = name[0].toUpperCase();
    const remainingChars = name.slice(1);
    const password = firstLetter + remainingChars + "@12345";
    return password;
}

export default generateNamePassword;