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
import { useEffect } from 'react';

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
  const [userServices, setUserServices] = useState([]);
  // const [tickBoxes, setTickBoxes] = useState([]);
  const [searchMode, setSearchMode] = useState("Director");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  // const [search, setSearch] = useState("");
  // let availableServices = ["Netflix", "Filmstriben", "Disney+", "HBO MAX", "Prime Video", "Sky Showtime", "Viaplay"];
  const [availableServices, setAvailableServices] = useState(["Could not find any services"]);

  function handleTickboxCheck(i) {
    // console.log(tickBoxes);
    console.log("Checked box " + i);

    if (userServices.includes(availableServices[i])) {
      console.log("removed " + availableServices[i] + " from userServices");
      setUserServices((userServices) => userServices.filter((a) => a !== availableServices[i]));
    } else {
      console.log("added " + availableServices[i] + " to userServices");
      setUserServices((userServices) => [...userServices, availableServices[i]]);
    }
  }

    
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
      setWidth(window.innerWidth);
  }

  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);

  const isMobile = width <= 900;
  const isTablet = width <= 1300;

  function getSize() {
      // return isMobile ? "100%" : "50%";
      return isMobile ? "100%" : (isTablet ? "75%" : "50%");
  }

  function getColumns() {
    return isMobile ? 1 : 2;
  }

  // run once on load
  React.useEffect(() => {
    console.log("Loaded");

    fetch("/services", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'mode':'no-cors'
      },
    }).then((res) =>
        res.json().then((jsondata) => {
            // Setting a data from api
            if (jsondata["names"].length > 0){
              setAvailableServices(jsondata["names"]);
              console.log("Loaded available services from api and found:");
              console.log(jsondata["names"]);
            } else {
              console.log("Could not find any services");
              setAvailableServices([]);
            }
        }).catch((err) => {
            console.log(err);
        } )
    );


    if(cookies.get('userServices')['userServices']){
      console.log("HERE");
      console.log(cookies.get('userServices')['userServices']);
      setUserServices(cookies.get('userServices')['userServices']);
      console.log("Loaded user services from cookie");
      console.log(cookies.get('userServices'));

    } else {
      // setServices(Array(jdata.length).fill(false));
      setUserServices([]);
      console.log("No cookie found");

    }


  }, []);

  function onSubmit(value) {
    setIsLoading(true);
    console.log("Submitted!");
    // event.preventDefault();
    console.log(value);
    // Using fetch to fetch the api from
    // flask server it will be redirected to proxy

    if (value === "") {
      alert("Please enter a director name");
      return;
    }
    if(userServices.every((val, i, arr) => val === false)){
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
        search: value,
        services: userServices,
        search_mode: searchMode,
      }),

    }).then((res) =>
        res.json().then((jsondata) => {
            // Setting a data from api
            setData(jsondata);
            console.log(jsondata);
            setIsLoading(false);
            console.log("Loaded data from api");

        }).catch((err) => {
            console.log(err);
        })
    );
    console.log("Submitted!");
  }

  return (
    <> 
    <Center>
      <Box width = {getSize()} padding = "30" >
          <Center>
          <Heading size="xl" isTruncated>
            May I Please Stream?
          </Heading>
          </Center>
          <Box position='relative' padding='10'>
            <Divider />
            <AbsoluteCenter bg='white' px='4'>
              {/* Please? I just really want to watch a movie */}
            </AbsoluteCenter>
          </Box>
          {/* <SearchBar handleSubmit = {onSubmit}/> */}
          <InputField onSubmit = {onSubmit} availableServices={ availableServices } userServices = {userServices} handleTickboxCheck = {handleTickboxCheck} searchMode={searchMode} setSearchMode={setSearchMode} isLoading = {isLoading} size = {() => getSize}/>
      <div className="results-frame">
        <Box position='relative' padding='50px'>
          <Divider />
          <AbsoluteCenter bg='white' px='4'>
            Results
          </AbsoluteCenter>
        </Box>
        

        <div className="results">
        <SimpleGrid columns={getColumns()} spacing={10}>
          {data.map(function (item, i){
            if(item){
              return <Result name={item["title"]} services={item["services"]} />
            }
          })}
        </SimpleGrid>
        </div>
      </div>
      </Box>
    </Center>
    </>
  );
}


function ActionDropdown({setSearchMode}) {
  return(
  <Select  onChange={(event) => setSearchMode(event) } W = "50%">
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
            {services.split(",").map((s) =><><Badge colorScheme='teal' variant='solid' isTruncated={true}> {s.trim()}</Badge> </> )}
            </VStack>
            {/* </SimpleGrid> */}
          </Box>
        </Flex>
        </CardBody>
    </Card>
  );
}      

function SearchBar({onSubmit, searchMode, isLoading}) {
  const [search, setSearch] = useState("");
  return (
    <Flex spacing={4} minW = "100%" gap={4} justify = "space-between">
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder= {String(searchMode) + " name ..."} flexGrow={1}/>

      <IconButton
        onClick={(_) => onSubmit(search)}
        isLoading = {isLoading} type="submit" aria-label='Search database' icon={<SearchIcon />} colorScheme='teal' minW = "50px" maxW = "50px"/>
    </Flex>
  );
}


function InputField({onSubmit, availableServices, userServices, handleTickboxCheck, searchMode, setSearchMode, isLoading, size}) {

  function onSearchModeChange(event) {
    setSearchMode(event.target.value);
  }

  return (
    <Center minW ={size} >
      <VStack gap={3} minW="100%">
        <SearchBar onSubmit = {onSubmit} searchMode = {searchMode} isLoading = {isLoading}/>

        <Flex spacing = {4} width = "100%">
          <ActionDropdown setSearchMode={onSearchModeChange} />
          <Spacer minW={4}/>
          <DrawerExample availableServices={ availableServices } userServices = {userServices} handleTickboxCheck= { handleTickboxCheck }/>
        </Flex>
      </VStack>
    </Center>
  );
}

function saveCookie({userServices}) {
  // const toast = useToast();
  // console.log("User services: " + userServices)
  cookies.set('userServices', {userServices}, { path: '/' });
  console.log("Saved the following services as a cookie:"); 
  console.log(cookies.get('userServices')); 
}


function DrawerExample({availableServices , userServices, handleTickboxCheck}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  function onSave({userServices}) {
    saveCookie({userServices});
    // setServices(services.filter((a, j) => tickBoxes[j]));
    onClose();
  }

  function trueOnClose(){
    // if(cookies.get('userServices')){
    //   setServices(cookies.get('userServices')['userServices']);
    // }else{
    //   setServices(Array(1).fill("None"));
    // }
    onClose();
    console.log("Closed");
  }

  function onOpenDrawer(){
    console.log(availableServices.length)
    console.log("Opened");
    // console.log(userServices)
    
    // var userHas = userServices.map((a, j) => userServices.includes(availableServices[j]));
    // console.log(userHas);
    // setTickBoxes(userHas);
    onOpen();
  }

  return (
    <>
      <Button ref={btnRef} colorScheme='teal' onClick={onOpenDrawer} minW="180px" isDisabled = {!availableServices.length > 0}> 
        {availableServices.length < 0 ? "No services found" : (userServices.length > 0 ? "Searching " + String(userServices.length) + " services" : "Choose services")}
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
          <DrawerHeader>Select your services</DrawerHeader>

          <DrawerBody>
            <CheckboxGroup defaultValue={['Netflix']}>
              <VStack align='start'>
                {availableServices.map(function (item, i){
                  if(item){
                    return <ServiceCheckbox service={item} isChecked = {userServices.includes(item)} handleTickboxCheck={() => handleTickboxCheck(i)}/>
                  }
                })}
              </VStack>
          </CheckboxGroup>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={trueOnClose}>
              Cancel
            </Button>
            <Button onClick = {() => onSave({userServices})} colorScheme = "teal">Save</Button>
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

