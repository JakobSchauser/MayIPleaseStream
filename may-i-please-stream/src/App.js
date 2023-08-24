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

export default function App() {
  // 2. Wrap ChakraProvider at the root of your app
  return (
    <ChakraProvider>
      <MainApp />
    </ChakraProvider>
  )
}




function MainApp() {
  const [services, setServices] = useState(Array(7).fill(false));
  const [data, setData] = useState([{"title":"Mad Max","services":"Netflix, Prime"}, {"title":"Batman","services":"Viaplay"}]);
  // const [search, setSearch] = useState("");
  let availableServices = ["Netflix", "Filmstriben", "Disney+", "HBO MAX", "Prime Video", "Sky Showtime", "Viaplay"];
 
  function handleTickboxCheck(i) {
    var newServices = services.slice(); 
    var a = 1;
    newServices[i] = !newServices[i];
    setServices(newServices);
    console.log(newServices); 
  }


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
        <h2 className='title'>May I Please Stream?</h2>
        {/* <SearchBar handleSubmit = {onSubmit}/> */}
        <InputField onSubmit = {onSubmit}/>
        <h3 className='title'> Services</h3>
        <DrawerExample services={ availableServices } handleTickboxCheck= { handleTickboxCheck }/>
      </div>
    <div className="results-frame">
      <h3 className='title'>Results</h3>
      <div className="results">
        <VStack spacing={4} align='stretch'>
        {data.map(function (item, i){
          if(item){
            return <Result name={item["title"]} services={item["services"]} />
          }
        })}
        </VStack>
      </div>
    </div>
    </div>
    </>
  );
}


function ActionDropdown({setSearchMode}) {
  return(
  <Select  onChange={(event) => setSearchMode(event) } width = "100%">
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
          <h3>{name}</h3>
          <Spacer />
          <h2> {services} </h2>
        </Flex>
        </CardBody>
    </Card>
  );
}      

function SearchBar({onSubmit, searchMode}) {
  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <Flex spacing={4} width = "200%">
        <Input placeholder= {String(searchMode) + " name ..."}  width='auto'  />
        <IconButton type="submit" aria-label='Search database' icon={<SearchIcon />} />
      </Flex>
    </form>
  );
}


function InputField({onSubmit}) {
  const [searchMode, setSearchMode] = useState("Director");

  function onSearchModeChange(event) {
    setSearchMode(event.target.value);
  }

  return (
    // <Flex spacing={4} >
    <Flex spacing={4} >
    <Box width = "100px">
    <SearchBar onSubmit = {onSubmit} searchMode = {searchMode}/>
    </Box>
    <Spacer />
    <Box width = "100px">
    <ActionDropdown setSearchMode={onSearchModeChange}/>
    </Box>
    </Flex> 
  // </Flex>
  );
}

function DrawerExample({services , handleTickboxCheck}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  return (
    <>
      <Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
        Open
      </Button>

      <Drawer
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
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
                    return <ServiceCheckbox service={item} handleTickboxCheck={() => handleTickboxCheck(i)}/>
                  }
                })}
              </VStack>
          </CheckboxGroup>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue'>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}


function ServiceCheckbox({service, handleTickboxCheck}) {
  // const [checked, setChecked] = useState(false);
  return (
    
    <Checkbox onChange={handleTickboxCheck} > {service} </Checkbox>
      
  );
}

