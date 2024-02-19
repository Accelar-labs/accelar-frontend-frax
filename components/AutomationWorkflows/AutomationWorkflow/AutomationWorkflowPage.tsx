/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import {
  useEffect,
  useState,
  ChangeEvent,
  FC,
  useContext,
  useCallback,
  useMemo,
} from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import './reactflow-overrides.css' // Ajuste o caminho conforme necessário

import TriggerNode from './ReactFlowComponents/TriggerNode'
import withProps from './ReactFlowComponents/withProps'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { AccountContext } from '@/contexts/AccountContext'
import SubNavBar from '@/components/Modals/SubNavBar'
import EditWorkflowModal from '../Modals/EditWorkflowModal'
import { AutomationWorkflowProps } from '@/types/automation'
import {
  createWorkflowTrigger,
  getAutomationWorkflow,
} from '@/utils/api-automation'
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance)

export const triggerOptions = [
  {
    name: 'Schedule',
    description: 'Schedule a cron job to run your workflow',
    imgSource: '/images/workflows/clock.svg',
    imgStyle: 'w-[18px]',
    imgStyleBoard: 'w-[11px]',
    type: 'Jobs',
    triggerType: 'CRON',
    pathSegment: '',
  },
]

const AutomationWorkflowPage = ({ id, workspaceId }) => {
  const [isCreatingNewApp, setIsCreatingNewApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [navBarSelected, setNavBarSelected] = useState('Board')
  const [isEditAppOpen, setIsEditAppOpen] = useState<any>()
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const {
    workspace,
    user,
    automationWorkflowNodeSelected,
    setAutomationWorkflowNodeSelected,
    setNodeIsLoading,
    automationWorkflowSelected,
    setAutomationWorkflowSelected,
  } = useContext(AccountContext)
  const [triggerOptionInfo, setTriggerOptionInfo] = useState<any>()
  const [nodeSelected, setNodeSelected] = useState<any>()

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#000' } }, eds),
      ),
    [],
  )
  const handleNodeRemove = (nodeIdToRemove) => {
    console.log('new test')
  }

  const nodeTypes = useMemo(
    () => ({
      trigger: withProps(TriggerNode, { handleNodeRemove }),
    }),
    [],
  )

  const pathname = usePathname()
  const { push } = useRouter()

  function pushBack() {
    const lastIndex = pathname.lastIndexOf('/')
    const final = pathname.substring(0, lastIndex)
    push(final)
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await getAutomationWorkflow(data, userSessionToken)
      if (!res) {
        pushBack()
        return
      }
      if (!res.nodeTriggerWorkflow) {
        // trigger not created yet
        setAutomationWorkflowNodeSelected('trigger')
      }
      setAutomationWorkflowSelected(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  async function createTrigger(triggerType: string) {
    setNodeIsLoading('trigger')
    const { userSessionToken } = parseCookies()

    const data = {
      id,
      type: triggerType,
    }

    try {
      const res = await createWorkflowTrigger(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setNodeIsLoading('')
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 h-full max-h-[calc(100vh-8rem)]  overflow-hidden px-[20px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container relative h-full text-[#fff] ">
          <div
            onClick={() => {
              const basePath = pathname.split('/')[1]
              console.log('the bash pathhhh ' + basePath)
              const newPath = `/${basePath}/${workspaceId}/llm-apps` // Constrói o novo caminho
              push(newPath)
            }}
            className="absolute left-4 flex -translate-y-[180%] cursor-pointer gap-x-[5px]"
          >
            <img
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left.svg"
              className="w-[12px]"
            ></img>
            <div className="text-[14px] text-[#c5c4c4] hover:text-[#b8b8b8]">
              Workflows
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="flex gap-x-[20px]">
              <img
                alt="ethereum avatar"
                src="/images/workflows/workflow.svg"
                className="w-[35px]"
              ></img>
              <div className="mt-auto text-[24px] font-medium">
                {automationWorkflowSelected?.name}
              </div>
            </div>
            {workspace?.isUserAdmin && (
              <div
                onClick={() => {
                  setIsEditAppOpen(true)
                }}
                className="cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
              >
                Edit Workflow
              </div>
            )}
          </div>
          <div className="mt-[45px] h-full ">
            <SubNavBar
              onChange={(value) => {
                setNavBarSelected(value)
              }}
              selected={navBarSelected}
              itensList={['Board', 'Analytics']}
            />
            <div className="mt-[20px] h-full 2xl:mt-[40px]">
              {navBarSelected === 'Board' && (
                <div className="h-full overflow-y-auto pb-[20px] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                  <div className="relative flex h-full w-full rounded-md  border-[0.5px] border-[#c5c4c45f] bg-[#1D2144]">
                    <ReactFlow
                      nodes={[
                        {
                          id: '1',
                          type: 'trigger',
                          position: { x: 500, y: 200 },
                          data: {
                            selects: {
                              'handle-0': 'smoothstep',
                              'handle-1': 'smoothstep',
                            },
                            defaultValueServerType: 'Small c3.x86 x 1',
                          },
                          sourcePosition: Position.Right,
                        },
                      ]}
                      edges={[]}
                      proOptions={{
                        hideAttribution: true,
                      }}
                      onNodesChange={(value) => {
                        console.log('chamado fuii')
                        // if (xnodeType !== 'validator') {
                        //   onNodesChange(value)
                        // }
                      }}
                      onEdgesChange={(value) => {
                        // validator type of nodes cannot be edited
                        console.log('chamado fuii')
                        // if (xnodeType !== 'validator') {
                        //   console.log('entrei nao')
                        //   onEdgesChange(value)
                        // }
                      }}
                      onConnect={onConnect}
                      onInit={onInit}
                      fitView
                      attributionPosition="top-right"
                      nodeTypes={nodeTypes}
                    >
                      <div className="absolute  bottom-[5%]">
                        <Controls />
                      </div>
                      <Background gap={16} />
                    </ReactFlow>
                    {automationWorkflowNodeSelected === 'trigger' && (
                      <div className="h-full w-[30%] rounded-r-md bg-[#060621] p-[20px] text-[14px] text-[#C5C4C4]">
                        <div>
                          <div className="">Select your trigger</div>
                          <div className="mt-[5px] text-[11px] text-[#c5c4c49d]">
                            This will be the event that will start the workflow
                          </div>
                        </div>
                        <div className="mt-[25px]">
                          <div>
                            <div className="mb-[7px] text-[12px]">Jobs</div>
                            {triggerOptions.map((option, index) => (
                              <div
                                onClick={() => {
                                  // handleSidebarClick(option.pathSegment, option.option)
                                }}
                                onMouseEnter={() => {
                                  setTriggerOptionInfo(option.name)
                                }}
                                onMouseLeave={() => {
                                  setTriggerOptionInfo('')
                                }}
                                key={index}
                                className={`${
                                  option.type !== 'Jobs' && 'hidden'
                                }`}
                              >
                                <div
                                  onClick={() => {
                                    createTrigger(option.triggerType)
                                  }}
                                  className={`relative mb-[5px] flex cursor-pointer items-center gap-x-[10px] rounded-[7px] border-[0.5px] border-[#c5c4c423] bg-[#e6e5e51e] px-[10px] py-[9px] hover:bg-[#6f6f6f4b]`}
                                >
                                  <img
                                    src={option.imgSource}
                                    alt="image"
                                    className={option.imgStyle}
                                  />
                                  <div className="text-center text-[13px] font-light">
                                    {option.name}
                                  </div>
                                  {triggerOptionInfo === option.name && (
                                    <div className=" absolute left-0 top-0 w-[200px] -translate-x-[105%] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px] font-normal text-[#c5c4c4]">
                                      <div>{option.description}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
        </div>
        {isEditAppOpen && (
          <EditWorkflowModal
            isOpen={isEditAppOpen}
            onClose={() => {
              setIsEditAppOpen(false)
            }}
            onUpdateM={() => {
              getData()
              setIsEditAppOpen(false)
            }}
            onDelete={() => {
              pushBack()
            }}
            app={automationWorkflowSelected}
          />
        )}
      </section>
    </>
  )
}

export default AutomationWorkflowPage
