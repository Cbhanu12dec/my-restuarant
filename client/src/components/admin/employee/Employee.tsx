import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import {
  Card,
  Flex,
  Grid,
  GridItem,
  Text,
  Avatar,
  HStack,
  Link,
  Portal,
  Code,
  VStack,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { ColumnsType } from "antd/es/table";
import AddEmployee from "./AddEmployee";
import { EmployeeTestData } from "../../../test-data/admin/employee";
import {
  DeleteIcon,
  EditIcon,
  EmailIcon,
  PhoneIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { faker } from "@faker-js/faker";
import axios from "axios";
import { useNotification } from "../../../contexts/Notification";
import { NotificationStatus } from "../../common/utils";
import { useNavigate } from "react-router-dom";

export interface EmployeeDatatype {
  key: React.Key;
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  employeeType: string;
  address: string;
  salary: string;
  joinedDate: string;
  about?: string;
}
const Employee = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addEmployeeModal, setAddEmployeeModal] = useState<boolean>(false);
  const [unformattedEmployeeData, setunformattedEmployeeData] = useState([]);
  const [employeeData, setEmployeeData] = useState<Array<EmployeeDatatype>>([]);
  const [forUpdate, setForUpdate] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<EmployeeDatatype>(
    employeeData[0]
  );
  const [initialFormData , setInitialFormData] = useState()
  const prepareData = (data: any) => {
    const formattedData = data
      .filter((item: any) => item.type === "employee")
      .reduce((accumulator: any, currentValue: any) => {
        return [
          ...accumulator,
          {
            key: currentValue.id,
            id: currentValue.id.toUpperCase(),
            name: currentValue.lastName + " " + currentValue.firstName,
            email: currentValue.email,
            phoneNumber: currentValue.phoneNumber,
            employeeType: currentValue.subtype,
            about: currentValue.about,
            address:
              currentValue.address.addressLine1 +
              ", " +
              currentValue.address.city +
              ", " +
              currentValue.address.state,
            salary: currentValue.salary,
            joinedDate: new Date(currentValue.joinedDate).toLocaleDateString(),
          },
        ];
      }, []);
    // setEmployeeData(formattedData);
    setUserProfile(formattedData[0]);
    return formattedData;
  };
  const onDeleteClicked = (data: EmployeeDatatype) => {
    axios
      .delete("http://localhost:5000/api/admin/v1/delete-employee/", {
        params: {
          id: data.id.toLowerCase(),
        },
      })
      .then((response: any) => {
        setEmployeeData(prepareData(response.data.employees));
        setShowNotification({
          status: NotificationStatus.SUCCESS,
          alertMessage: "Employee info deleted successfully..!",
          showAlert: true,
        });
      })
      .catch(() => {
        setShowNotification({
          status: NotificationStatus.ERROR,
          alertMessage: "Failed to retreive employees information..!",
          showAlert: true,
        });
      });
  };

  const getActualData = (data:any) =>{
    const userData  =  unformattedEmployeeData.filter((item:any)=> item.id.toLowerCase()=== data.id.toLowerCase());
    return userData[0];
  }
  const onUpdateClicked = (data: EmployeeDatatype) => {
    setInitialFormData(getActualData(data) as any);
    setForUpdate(true);
    setAddEmployeeModal(true)
   
  };

  const columns: ColumnsType<EmployeeDatatype> = [
    {
      title: "Emplyee ID",
      dataIndex: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => {
        return (
          <HStack>
            <Avatar
              size={"sm"}
              name="Ryan Florence"
              src={faker.image.avatar()}
            />
            <Text textColor="gray.600" fontWeight={"semibold"}>
              {text}
            </Text>
            ,
          </HStack>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
    },
    {
      title: "Employee Type",
      dataIndex: "employeeType",
      filters: [
        {
          text: "Manager",
          value: "manager",
        },
        {
          text: "Employee",
          value: "employee",
        },
      ],
      onFilter: (value: any, record) =>
        record.employeeType.indexOf(value) === 0,
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => (
        <>
          {text === "Manager" ? (
            <Tag color={"green"} key={text}>
              {text.toUpperCase()}
            </Tag>
          ) : (
            <Tag color={"blue"} key={text}>
              {text.toUpperCase()}
            </Tag>
          )}
        </>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Salary/hr",
      dataIndex: "salary",
    },
    {
      title: "Action",
      key: "action",
      width: "45px",
      render: (_, record) => (
        <HStack>
          <IconButton
            aria-label="Search database"
            onClick={() => {
              onDeleteClicked(record);
            }}
            icon={<DeleteIcon />}
            size="sm"
          />
          <IconButton
            aria-label="Search database"
            onClick={() => onUpdateClicked(record)}
            icon={<EditIcon />}
            size="sm"
          />
        </HStack>
      ),
    },
    // {
    //   title: "Joined Date",
    //   dataIndex: "joinedDate",
    //   responsive: ["sm"],
    // },
  ];

  const { setShowNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/v1/get-employee-details")
      .then((response: any) => {
        setunformattedEmployeeData(response.data.employees);
        setEmployeeData(prepareData(response.data.employees));
        // setShowNotification({
        //   status: NotificationStatus.SUCCESS,
        //   alertMessage: "Employee info retreived successfully..!",
        //   showAlert: true,
        // });
      })
      .catch(() => {
        setShowNotification({
          status: NotificationStatus.ERROR,
          alertMessage: "Failed to retreive employees information..!",
          showAlert: true,
        });
      });
  }, [addEmployeeModal]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <React.Fragment>
      {/* <Notifications /> */}
      <Flex mx={{ base: "4", lg: "10" }} my="6" direction={"column"}>
        <Text fontSize={"xl"} fontWeight="bold">
          Employees List
        </Text>
        <Grid
          mt="4"
          templateRows={{ base: "repeat(2, 1fr)", lg: "repeat(1, 1fr)" }}
          templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(6, 1fr)" }}
          gap={{ base: 2, lg: 4 }}
        >
          <GridItem colSpan={{ base: 1, lg: 4 }}>
            <Flex
              bg="white"
              p="6"
              borderRadius={"md"}
              w="100%"
              direction={"column"}
            >
              <Flex justifyContent={"space-between"} mb="4">
                <InputGroup maxW="44" alignItems={"center"} rounded="md">
                  <InputLeftElement
                    pointerEvents="none"
                    children={<SearchIcon color="gray.300" />}
                  />
                  <Input
                    variant="filled"
                    placeholder="Search.."
                    size={{ base: "sm" }}
                  />
                </InputGroup>
                <Button
                  size={{ base: "sm", lg: "md" }}
                  colorScheme="orange"
                  onClick={() => setAddEmployeeModal(true)}
                >
                  Add Employee
                </Button>
              </Flex>
              <Table
                onRow={(record, rowIndex) => {
                  return {
                    onClick: (event) => {
                      setUserProfile(record);
                    },
                  };
                }}
                scroll={{ x: 400 }}
                style={{ width: "100%" }}
                size="large"
                // rowSelection={rowSelection as any}
                columns={columns}
                dataSource={employeeData}
              />
            </Flex>
          </GridItem>
          <GridItem colSpan={2} bg="white" borderRadius={"md"}>
            <Flex p="4">
              <Avatar
                size="xl"
                name="Christian Nwamba"
                src="https://bit.ly/code-beast"
              />
              <Flex mx="4" direction={"column"}>
                <Text
                  fontSize={"xl"}
                  fontFamily="semibold"
                  textColor={"orange.500"}
                >
                  {userProfile?.name}
                </Text>
                <Text textColor={"gray.700"}>{userProfile?.employeeType}</Text>
                <HStack mt="4" gap={4}>
                  <HStack>
                    <Icon as={EmailIcon} />

                    <Link>Email</Link>
                  </HStack>
                  <HStack>
                    <Icon as={PhoneIcon} />
                    <Link>Call</Link>
                  </HStack>
                </HStack>
              </Flex>
            </Flex>
            <Code
              bg="gray.50"
              children="Personal Details"
              p="2"
              width={"94%"}
              mx="4"
              my="4"
            />
            <Flex
              direction={"column"}
              alignItems="start"
              justifyContent={"start"}
              p="4"
            >
              <VStack gap={"3"} alignItems="start" px="2">
                <Flex direction={"column"}>
                  <Text fontSize={"xs"} fontWeight="bold">
                    About me :
                  </Text>
                  <Text>{userProfile?.about}</Text>
                </Flex>
                <Flex direction={"column"}>
                  <Text fontSize={"xs"} fontWeight="bold">
                    Email :
                  </Text>
                  <Text>{userProfile?.email}.</Text>
                </Flex>
                <Flex direction={"column"}>
                  <Text fontSize={"xs"} fontWeight="bold">
                    Phone Number :
                  </Text>
                  <Text>{userProfile?.phoneNumber}.</Text>
                </Flex>
                <Flex direction={"column"}>
                  <Text fontSize={"xs"} fontWeight="bold">
                    Joined Date :
                  </Text>
                  <Text>{userProfile?.joinedDate}.</Text>
                </Flex>
                <Flex direction={"column"}>
                  <Text fontSize={"xs"} fontWeight="bold">
                    Salary :
                  </Text>
                  <Text>{userProfile?.salary}.</Text>
                </Flex>
                <Flex direction={"column"}>
                  <Text fontSize={"xs"} fontWeight="bold">
                    Address :
                  </Text>
                  <Text>{userProfile?.address}.</Text>
                </Flex>
              </VStack>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>

      <AddEmployee
        isModalOpen={addEmployeeModal}
        setIsModalOpen={setAddEmployeeModal}
        defaultData={initialFormData}
        isUpdate={forUpdate}
        setIsUpdate={setForUpdate}
      />
    </React.Fragment>
  );
};

export default Employee;
