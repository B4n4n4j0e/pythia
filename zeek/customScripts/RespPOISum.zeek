module RespPOISum;

export {
    # Create an ID for our new stream. By convention, this is
    # called "LOG".
    redef enum Log::ID += { LOG };

    # Define the record type that will contain the data to log.
    type Info: record {
        ts: time        &log;
	    proto: string &log;
        resp_p: port     &log;
        counter: count &log &default=0;
    };
    

event zeek_init() 
    {
    local filter : Log::Filter = 
    [
        $name="sqlite",
        $path="/var/db/pythia_summary",
        $config=table(["tablename"]="resp_poi_sum"),
        $writer=Log::WRITER_SQLITE
    ];
    Log::create_stream(RespPOISum::LOG, [$columns=Info, $path="resp_poi_sum"]);
    Log::add_filter(RespPOISum::LOG, filter);
    }
}
