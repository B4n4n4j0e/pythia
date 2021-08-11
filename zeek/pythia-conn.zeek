module PythiaConn;

export {
	# Create an ID for Stream. By convention called LOG
	redef enum Log::ID += { LOG };

	# Define the record type that will contain the data to log
	type Info: record {
		ts: time 	&log;
		uid: string 	&log;
		id: conn_id	&log;
		proto: transport_proto &log;
		service: string &log &optional;
		orig_pkts: count &log;
		resp_pkts: count &log;
	};
}

redef record connection += {
	pythia: Info &optional;
};


event zeek_init() &priority=5 
{	
	local filter : Log::Filter = 
	[
	$name="sqlite",
	$path="/var/db/pythia",
	$config=table(["tablename"]="pythia_conn"),
	$writer=Log::WRITER_SQLITE
	];
	Log::create_stream(PythiaConn::LOG, [$columns=Info, $path="pythia-conn"]);
	Log::remove_filter(PythiaConn::LOG,"default");
	Log::add_filter(PythiaConn::LOG,filter);
#	Log::create_stream(PythiaConn::LOG, [$columns=Info, $path="pythia-conn"]);
}

#event connection_established(c:connection) {
#	local rec: Pythia::Info = [$ts=network_time(), $id=c$id];
#	c$pythia=rec;
#	Log::write(Pythia::LOG,rec);
#}

#event connection_state_remove(c:connection) &priority=5 {
#	local rec: Pythia::Info = [$ts=network_time(), $id=c$id];
#	Log::write(Pythia::LOG,rec);
#}

event Conn::log_conn(conn: Conn::Info) {
	local rec: PythiaConn::Info = [$ts=conn$ts, $uid =conn$uid, $id = conn$id,$proto= conn$proto, $orig_pkts=conn$orig_pkts, $resp_pkts=conn$resp_pkts ]; 
	if ( conn ?$ service)
		rec$service = conn$service;
	Log::write(PythiaConn::LOG,rec);

}


#event new_connection(c:connection) {
#	local rec: Pythia::Info = [$ts=network_time(), $id=c$id];
#	c$pythia=rec;
#	Log::write(Pythia::LOG,rec);
#}
