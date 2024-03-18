import Head from "next/head";
// import Image from "next/image";


import { useState, useEffect } from 'react'

import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

import { useDisclosure } from '@mantine/hooks';
import { Modal, Stack, Box, Tabs, Text, TextInput, Image, Button, Alert, lighten, FocusTrap } from '@mantine/core';
import { IconMoodCheck, IconMoodSad, IconCornerDownRight } from '@tabler/icons-react';

type Country = {
  name: {
    common: string;
  },
  flag: string,
  flags: {
    png: string;
    svg: string;
  }
}

const inter = Inter({ subsets: ["latin"] });

interface SkipButtonProps {
  handleSkipCountry: () => void;
}
const SkipButton = (props: SkipButtonProps) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [startCountdown, setStartCountdown] = useState<boolean>(false);

  useEffect(() => {
    if (startCountdown) {
      const interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
      if (countdown === 0) {
        setCountdown(2);
        clearInterval(interval);
        setStartCountdown(false);
        props.handleSkipCountry();
      }
      return () => clearInterval(interval);
    }
  }, [startCountdown, countdown])

  return (
    <Button onClick={() => setStartCountdown(true)} w="fit-content" color="#c91a25" size="compact-sm" variant="light">
      {startCountdown ? `Skipping in ${countdown}`: 'Skip'}
    </Button>
  )
}

const AnswerFeedbackComponent = (props: {answer: string, isCorrect: boolean | null, handleCloseNotification: () => void}): JSX.Element => {
  return (
    <>
    {props.isCorrect ?
      <Alert title="Correct!" color="teal" icon={<IconMoodCheck />} />
      :
      <Alert title="Incorrect!" color="#c91a25" icon={<IconMoodSad />}>
        <Text style={{display: "flex"}}>
          <IconCornerDownRight />
          <Text ml="4" span>{props.answer}</Text>
        </Text>
      </Alert>}
    </>
  )
}


function QuickPlayModal(props: {openWelcomeModal: () => void, countries: {}[], handleSetIsQuickPlay: (value: boolean) => void}): JSX.Element {
  const [opened, { open, close }] = useDisclosure(true);
  const [active, { toggle }] = useDisclosure(true);

  const [activeCountry, setActiveCountry] = useState<{} | null>((props.countries[Math.floor(Math.random() * 250)] as Country));
  const [getNewCountry, setGetNewCountry] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasInputError, setHasInputError] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    if (getNewCountry) {
      const newRandonCountry = (props.countries[Math.floor(Math.random() * 250)] as Country);
      setActiveCountry(newRandonCountry);
      setGetNewCountry(false);
    }
  }, [getNewCountry])

  const handleGetNewCountry = () => {
    setGetNewCountry(prevState => !prevState);
  }

  const handleSubmitAnswer = (value: string) => {
    toggle();
    if (value === '') {
      setHasInputError(true);
      return;
    }

    if (value.toLowerCase() === (activeCountry as Country).name.common.toLowerCase()) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }

    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      handleGetNewCountry();
      setValue('');
    }, 2000)
  }

  const handleCloseNotification = () => {
    setShowNotification(false);
  }

  return (
    <Modal
      centered
      title="Quick Play"
      style={{color: "#000"}}
      opened={opened}
      onClose={() => {
        close();
        props.handleSetIsQuickPlay(false);
        props.openWelcomeModal();
      }}>
      <Stack>
      <Box color='#000'>What country is this?</Box>
        {activeCountry && <Box><img style={{width:"100%", border: "1px solid #bcbcbc"}}src={`${(activeCountry as Country).flags.png}`} /></Box>}
        {showNotification && <AnswerFeedbackComponent answer={(activeCountry as Country).name.common} isCorrect={isCorrect} handleCloseNotification={handleCloseNotification} />}
        <FocusTrap active={active}>
          <TextInput
            styles={{input: {background: hasInputError ? lighten("#c91a25", 0.9) : "unset"}}}
            label="Country name"
            aria-label="Country name"
            placeholder={hasInputError ? "Country name required" : "Country name"}
            value={value}
            error={hasInputError ? "Error: input empty" : false}
            required
            data-autofocus
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
            onFocus={() => {
              setHasInputError(false);
              if (active) toggle();
            }} />
        </FocusTrap>
        <Button color="teal" style={{color:"#fff"}} onClick={() => handleSubmitAnswer(value)}>
          Submit
        </Button>
        <SkipButton handleSkipCountry={handleGetNewCountry} />
      </Stack>
    </Modal>
  )
}

interface WelcomeModalProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  handleSetIsQuickPlay: (value: boolean) => void;
}
function WelcomeModal(props: WelcomeModalProps): JSX.Element {
  // const [opened, { open, close }] = useDisclosure(true);
  return (
    <Modal opened={props.opened} onClose={props.close} title="Welcome to Banderas!" centered>
      <Tabs style={{color: "#000", display: "flex", justifyContent: "center", alignItems: "center"}} orientation="vertical" defaultValue="welcome">
        <Tabs.List>
          <Tabs.Tab value="welcome">
            Welcome
          </Tabs.Tab>
          {/* <Tabs.Tab value="quick play">
            Quick Play
          </Tabs.Tab> */}
          {/* <Tabs.Tab value="rapid">
            Rapid
          </Tabs.Tab> */}
          {/* <Tabs.Tab value="explore">
            Explore
          </Tabs.Tab> */}
        </Tabs.List>

        <Tabs.Panel value="welcome" style={{ padding: "20px"}}>
          <Stack>
            <Text>A game where you guess the country based on its flag.</Text>
            <Text>Ty out <Text span c="teal">Quick Play</Text>! It&#39;s the quickest way to get started.</Text>
            <Button
              styles={{root: {background: "rgb(18, 184, 134)"}}}
              onClick={() => {
              props.handleSetIsQuickPlay(true);
              props.close();
            }}>
            Quick Play
          </Button>
          </Stack>
        </Tabs.Panel>

        {/* <Tabs.Panel value="quick play" style={{ padding: "20px"}}>
          <Button onClick={() => {
            props.handleSetIsQuickPlay(true);
            close();
            }}>
            Quick Play
          </Button>
        </Tabs.Panel> */}

        {/* <Tabs.Panel value="rapid" style={{ padding: "20px"}}>
          Rapid!
        </Tabs.Panel> */}

        {/* <Tabs.Panel value="explore" style={{ padding: "20px"}}>
          Explore
        </Tabs.Panel> */}
          
      </Tabs>
    </Modal>
  )
}

export default function Home() {
  const [countries, setCountries] = useState<{}[]>([]);
  const [isQuickPlay, setIsQuickPlay] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure(true);

  const handleSetIsQuickPlay = () => {
    setIsQuickPlay(prevState => !prevState);
  }

  useEffect(() => {
    if (countries.length === 0) {
      fetch("https://restcountries.com/v3.1/all")
        .then(res => res.json())
        .then(res => setCountries(res))
        .catch(err => console.log(err)) 
    }
  }, [countries.length])

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WelcomeModal opened={opened} open={open} close={close} handleSetIsQuickPlay={handleSetIsQuickPlay} />
      {isQuickPlay && <QuickPlayModal openWelcomeModal={open} countries={countries} handleSetIsQuickPlay={handleSetIsQuickPlay} />}
      <main className={`${styles.main} ${inter.className}`}>
        <ul style={{margin: 0, listStyleType: 'none', display: 'flex', flexWrap: 'wrap', gap: 40,backgroundColor: 'rgba(0, 0, 0, 0.1)',}}>
          {countries.length > 0 &&
            countries.map((country: { [key: string]: any}, index) => {
              return (
                <li key={index}>
                  <Image w={100} h={50} src={country.flags.png} />
                </li>
              )
            })
          }
        </ul>
      </main>
    </>
  );
}
