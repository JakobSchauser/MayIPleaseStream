import {useState} from 'react';
// import {useEffect} from 'react';
import * as React from 'react'


// 1. import `ChakraProvider` component
import { ChakraProvider, Divider } from '@chakra-ui/react'
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react'
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { VStack, HStack } from '@chakra-ui/react'
import { Center } from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import { Flex } from '@chakra-ui/react'
import { Spacer } from '@chakra-ui/react'
// import { ChevronDownIcon } from '@chakra-ui/icons'
import { SearchIcon } from '@chakra-ui/icons'
import { IconButton } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'
import { Heading } from '@chakra-ui/react'
import { AbsoluteCenter } from '@chakra-ui/react'
import { SimpleGrid } from '@chakra-ui/react'
import { Badge } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'

import Cookies from 'universal-cookie';
const cookies = new Cookies();


export default function App() {
  // 2. Wrap ChakraProvider at the root of your app
  return (
    <ChakraProvider>
      <MainApp />
    </ChakraProvider>
  )
}




function MainApp() {
  const [services, setServices] = useState(Array(2).fill(false));
  const [searchMode, setSearchMode] = useState("Director");

  const [data, setData] = useState([]);
  // const [search, setSearch] = useState("");
  // let availableServices = ["Netflix", "Filmstriben", "Disney+", "HBO MAX", "Prime Video", "Sky Showtime", "Viaplay"];
  const [availableServices, setAvailableServices] = useState(["Could not find any services"]);
  function handleTickboxCheck(i) {
    console.log(services);
    console.log("Checked box " + i);
    var newServices = services.slice(); 
    newServices[i] = !newServices[i];
    setServices(newServices);
    console.log(newServices); 
  }

  // run once on load
  React.useEffect(() => {
    console.log("Loaded");
    let jdata = ["netflix"]
    fetch("/services", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) =>
        res.json().then((jsondata) => {
            // Setting a data from api
            setAvailableServices(jsondata["names"]);
            console.log("Loaded services from api and found:");
            console.log(jsondata["names"]);
            jdata = jsondata["names"];
        }).catch((err) => {
            console.log(err);
        } )
    );
    console.log(cookies.get('userServices'));

    if(cookies.get('userServices')){
      setServices(cookies.get('userServices')['userServices']);
      console.log("Loaded services from cookie");
    } else {
      setServices(Array(jdata.length).fill(false));
      console.log("No cookie found");
    }


  }, []);

  function onSubmit(event) {
    event.preventDefault();
    console.log(event.target[0].value);
    // Using fetch to fetch the api from
    // flask server it will be redirected to proxy

    if (event.target[0].value === "") {
      alert("Please enter a director name");
      return;
    }
    if(services.every((val, i, arr) => val === false)){
      alert("Please select at least one service");
      return;
    }
    setData([{"title":"Loading...","services":""}]);

    fetch("/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search: event.target[0].value,
        services: services,
        search_mode: searchMode,
      }),

    }).then((res) =>
        res.json().then((jsondata) => {
            // Setting a data from api
            setData(jsondata);
            console.log(jsondata);

        }).catch((err) => {
            console.log(err);
        })
    );
    console.log("Submitted!");
  }

  return (
    <>  
    <div className="app-frame">
      <div className="header">
        <Center>
        <Heading size="xl" isTruncated>
          May I Please Stream?
        </Heading>
        </Center>
        <Box position='relative' padding='10'>
          <Divider />
          <AbsoluteCenter bg='white' px='4'>
            Please? I just really want to watch a movie
          </AbsoluteCenter>
        </Box>
        {/* <SearchBar handleSubmit = {onSubmit}/> */}
        <InputField onSubmit = {onSubmit} availableServices={ availableServices } setServices = {setServices} userServices = {services} handleTickboxCheck = {handleTickboxCheck} searchMode={searchMode} setSearchMode={setSearchMode}/>
      </div>
    <div className="results-frame">
      <Box position='relative' padding='50px'>
        <Divider />
        <AbsoluteCenter bg='white' px='4'>
          Results
        </AbsoluteCenter>
      </Box>

      <div className="results">
      <SimpleGrid columns={2} spacing={10}>
        {data.map(function (item, i){
          if(item){
            return <Result name={item["title"]} services={item["services"]} />
          }
        })}
      </SimpleGrid>
      </div>
    </div>
    </div>
    </>
  );
}


function ActionDropdown({setSearchMode}) {
  return(
  <Select  onChange={(event) => setSearchMode(event) } width = "200px">
    <option value='Director'>Search by Director</option>
    <option value='Actor'>Search by Actor</option>
    <option value='Genre'>Search by Genre</option>
  </Select>
  )
}

function Result({name, services}) {
  return (
    <Card>
      <CardBody>
        <Flex spacing={4} >
          <Box w = "50%">
          {name}
          </Box>
          <Spacer />

          <Box w = "50%">
            {/* <SimpleGrid columns = {Math.min(2,3)} spacing={1} > */}
            <VStack spacing={1} >
            {services.split(",").map((s) =><><Badge> {s.trim()}</Badge> </> )}
            </VStack>
            {/* </SimpleGrid> */}
          </Box>
        </Flex>
        </CardBody>
    </Card>
  );
}      

function SearchBar({onSubmit, searchMode}) {
  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <Box >
        <HStack spacing={2} width = "100%">
          <Input placeholder= {String(searchMode) + " name ..."} minW = "300px"/>
          <IconButton type="submit" aria-label='Search database' icon={<SearchIcon />} />
        </HStack>
      </Box>
    </form>
  );
}


function InputField({onSubmit, setServices, availableServices, userServices, handleTickboxCheck,searchMode, setSearchMode}) {

  function onSearchModeChange(event) {
    setSearchMode(event.target.value);
  }

  return (
    <Flex spacing={10}>
      <SearchBar onSubmit = {onSubmit} searchMode = {searchMode}/>
      <Spacer />
      <HStack>
        <ActionDropdown setSearchMode={onSearchModeChange}/>
        <DrawerExample services={ availableServices } setServices = {setServices} userServices = {userServices} handleTickboxCheck= { handleTickboxCheck }/>
      </HStack>
    </Flex>
  );
}

function saveCookie({userServices}) {
  // const toast = useToast();
  cookies.set('userServices', {userServices}, { path: '/' });
  console.log("Saved the following services:"); 
  // toast({
  //   title: 'Services saved.',
  //   description: "Your services have been saved as a cookie.",
  //   status: 'success',
  //   duration: 6000,
  //   isClosable: true,
  // })
  console.log(cookies.get('userServices')); 
}


function DrawerExample({services , setServices, userServices, handleTickboxCheck}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  function onSave({userServices}) {
    saveCookie({userServices});
    onClose();
  }

  function trueOnClose(){
    setServices(cookies.get('userServices')['userServices']);
    onClose();
    console.log("Closed");
  }

  return (
    <>
      <Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
        Choose Services
      </Button>

      <Drawer
        isOpen={isOpen}
        placement='left'
        onClose={trueOnClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create your account</DrawerHeader>

          <DrawerBody>
            <CheckboxGroup colorScheme='teal' defaultValue={['Netflix']}>
              <VStack align='start'>
                {services.map(function (item, i){
                  if(item){
                    return <ServiceCheckbox service={item} isChecked = {userServices[i]} handleTickboxCheck={() => handleTickboxCheck(i)}/>
                  }
                })}
              </VStack>
          </CheckboxGroup>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={trueOnClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick = {() => onSave({userServices})}>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}


function ServiceCheckbox({service, isChecked, handleTickboxCheck}) {
  // const [checked, setChecked] = useState(false);
  return (
    
    <Checkbox onChange={handleTickboxCheck} isChecked = {isChecked}> {service} </Checkbox>
      
  );
}

