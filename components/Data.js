import {Text} from 'react-native';

export const Data = ()=>{
    const name = "ALI USMAN BAJWA!"
    const Age = 22;
    const Degree = "BSCS";

    return(
        <>
        <Text>My Name is {name}</Text>
        <Text>My Age is {Age}</Text>
        <Text>My Degree is {Degree}</Text>
        </>
    );
}