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
  const [data, setData] = useState([]);
  // const [search, setSearch] = useState("");
  let availableServices = ["Netflix", "Filmstriben", "Disney+", "HBO MAX", "Prime Video", "Sky Showtime", "Viaplay"];
 
  function handleTickboxCheck(i) {
    var newServices = services.slice(); 
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
        <InputField onSubmit = {onSubmit} availableServices={ availableServices } handleTickboxCheck = {handleTickboxCheck}/>
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
          {name}
          <Spacer />
          <Box >
            <SimpleGrid columns = {Math.min((services.split(",").length),3)} spacing={1} >
            {services.split(",").map((s) =><><Badge> {s.trim()}</Badge> </> )}
            </SimpleGrid>
          </Box>
        </Flex>
        </CardBody>
    </Card>
  );
}      

function SearchBar({onSubmit, searchMode}) {
  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <HStack spacing={0} >
        <Input placeholder= {String(searchMode) + " name ..."}  width='350px'  />
        <IconButton type="submit" aria-label='Search database' icon={<SearchIcon />} />
        </HStack>
    </form>
  );
}


function InputField({onSubmit, availableServices, handleTickboxCheck}) {
  const [searchMode, setSearchMode] = useState("Director");

  function onSearchModeChange(event) {
    setSearchMode(event.target.value);
  }

  return (
    // <Flex spacing={4} >
    <Flex spacing={4} width = "100%">
    <SearchBar onSubmit = {onSubmit} searchMode = {searchMode}/>
    <Spacer />
    <ActionDropdown setSearchMode={onSearchModeChange}/>
    <Spacer />
    <DrawerExample services={ availableServices } handleTickboxCheck= { handleTickboxCheck }/>
    </Flex> 
  // </Flex>
  );
}

function DrawerExample({services , handleTickboxCheck}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  function onSave() {
    
    onClose();
  }

  return (
    <>
      <Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
        Choose Services
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
            <Button colorScheme='blue' onClick = {onSave}>Save</Button>
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

