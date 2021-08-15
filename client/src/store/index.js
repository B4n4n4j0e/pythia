import Vue from 'vue'
import Vuex from 'vuex';
import ConnectionsService from '../services/ConnectionService';
import NoticeService from '../services/NoticeService';
import ConnectionSummaryService from '../services/ConnectionSummaryService';

Vue.use(Vuex);

export default new Vuex.Store({
    state:{
        connections: [],
        startTime: null,
        endTime: null,
        globalPacketCount: 0,
        notices: [],
        connectionSummary:[]
    },


    mutations:{
        setConnections (state, newConnections) {
            state.connections = newConnections;
        },
        setNotices (state, notices) {
            state.notices = notices;
        },

        setConnectionSummary (state, connectionSummary) {
            state.connectionSummary = connectionSummary;
        },

        setGlobalPacketCount (state, globalPacketCount) {
            state.globalPacketCount = globalPacketCount;
        },
    
    
        addConnections() {
        },

        setStartTime(state, startTime) {
            state.startTime = startTime;
        },

        setEndTime(state, endTime) {
            state.endTime = endTime;
        },


    },

    actions:{
        getConnectionsByTime(context) {
            ConnectionsService.getConnections(context.state.startTime,context.state.endTime).then((response) => {
            context.commit('setConnections',response.data);
            context.commit('setGlobalPacketCount', context.state.connections.length)
        })
        },

        getConnectionSummaryByTime(context) {
            ConnectionSummaryService.getConnectionSummary(context.state.startTime,context.state.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts*1000)
                })
                context.commit('setConnectionSummary',response.data);
            })

        },

        getDashboardDataByTime(context) {
            NoticeService.getNotices(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setNotices',response.data)
            })
            //@todo mit dispatch verbinden und rauswerfen...
            ConnectionSummaryService.getConnectionSummary(context.state.startTime,context.state.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts*1000)
                })
                context.commit('setConnectionSummary',response.data);
            })

            ConnectionsService.getConnections(context.state.startTime,context.state.endTime).then((response) => {
                context.commit('setConnections',response.data);
                context.commit('setGlobalPacketCount', context.state.connections.length)
        }).then(() => {NoticeService.getNotices(context.state.startTime,context.state.endTime).then((response) => {
            context.commit('setNotices', response.data);
        })})
     }
    },
    getters:{

        startTime: state => {
            if (state.startTime) {
                var time = new Date(state.startTime)
                return time.toTimeString().slice(0,5)            }
            return null

        },

        endTime: state => {
            if (state.endTime) {
                var time = new Date(state.endTime)
                return time.toTimeString().slice(0,5)            }
            return null

        },

        startTimeUnix: state => {
            if (state.startTime) {
                return state.startTime/1000           
            }
            return null
        },

        endTimeUnix: state => {
            if (state.startTime) {
                return state.endTime/1000           
            }
            return null
        },



        startDate: state => {
            if (state.startTime) {
                var date = new Date(state.startTime)
                var dateWithOffset = new Date(date-(date.getTimezoneOffset()*60000))
                return dateWithOffset.toISOString().slice(0,10)
            }
            return null

        },

        endDate: state => {
            if (state.endTime) {
                var date = new Date(state.endTime)
                var dateWithOffset = new Date(date-(date.getTimezoneOffset()*60000))
                return dateWithOffset.toISOString().slice(0,10)
            }
            return null
        },


        pieData: state => {
            var data = new Map()
            state.connections.forEach((element) => {
                if (data.has(element["service"])) {
                  data.set(element["service"], data.get(element["service"]) + 1);
                } else {
                  data.set(element["service"], 1);
                }
              });                    return data;
            },

            barChartData: state => {
                const tmpData = new Map()
                state.connections.forEach((element) => {
                    if (tmpData.has(element["proto"])) {
                      tmpData.set(element["proto"], tmpData.get(element["proto"]) + 1);
                    } else {
                      tmpData.set(element["proto"], 1);
                    }
                  });              
                  return new Map([...tmpData].sort((a, b) =>  b[1]-a[1] ));
                },

        nodeData: state => {

            const nodes = new Map()

            state.connections.forEach(element => {
                var origin = element['source']
                var responder = element['target']
    
                if(nodes.has(origin) && nodes.has(responder)){
                    nodes.set(origin,nodes.get(origin)+1);
                    nodes.set(responder,nodes.get(responder)+1);
                }
                else if (nodes.has(origin)) {
                    nodes.set(origin,nodes.get(origin)+1);
                    nodes.set(responder,1);
    
                }
                else if (nodes.has(responder)) {
                    nodes.set(origin,1);
                    nodes.set(responder,nodes.get(responder)+1);
                }
                else {
                    nodes.set(responder,1);
                    nodes.set(origin,1);
                }
    
            });
                if (nodes.size > 0) {
                   return Array.from(nodes, ([id, value]) => ({ id, value }));
                }
                else {
                    return []
                }

        }



    },
})