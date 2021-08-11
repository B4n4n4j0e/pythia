module PythiaNotice;

export {

	# Create an ID for Stream. By convention called LOG
	redef enum Log::ID += { LOG };

	# Define the record type that will contain the data to log
	type Info: record {
		ts: time 	&log;
		uid: string	&log &optional;
		note: Notice::Type 	&log;
		msg: string 	&log;
	};
}

#redef record notice += {
#	pythia: Info &optional;
#};


event zeek_init() &priority=5 
{	
	local filter : Log::Filter = 
	[
	$name="sqlite",
	$path="/var/db/pythia",
	$config=table(["tablename"]="pythia_notices"),
	$writer=Log::WRITER_SQLITE
	];
	Log::create_stream(PythiaNotice::LOG, [$columns=Info, $path="pythia-notice"]);
	Log::remove_filter(PythiaNotice::LOG,"default");
	Log::add_filter(PythiaNotice::LOG,filter);
}

#event connection_established(c:connection) {
#	local rec: Pythia-notice::Info = [$ts=network_time(), $id=c$id];
#	c$pythia=rec;
#	Log::write(Pythia-notice::LOG,rec);
#}

#event connection_state_remove(c:connection) &priority=5 {
#	local rec: Pythia::Info = [$ts=network_time(), $id=c$id];
#	Log::write(Pythia::LOG,rec);
#}

event Notice::log_notice(note: Notice::Info) {
	local rec: PythiaNotice::Info = [$ts=note$ts,$note=note$note, $msg=note$msg]; 
	if ( note ?$ uid)
		rec$uid = note$uid;
	Log::write(PythiaNotice::LOG,rec);

}


#event new_connection(c:connection) {
#	local rec: Pythia::Info = [$ts=network_time(), $id=c$id];
#	c$pythia=rec;
#	Log::write(Pythia::LOG,rec);
#}
