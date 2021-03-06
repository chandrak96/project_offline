<?php

class DB{

	private static $_instance = null;
	private $_query,
			$_pdo,
			$_results,
			$_error = false,
			$_count = 0,
			$_city;

	//@overwrite
	private function __construct($remote_server = false){

		try{
			if(!$remote_server){
				$this->_pdo = new PDO('mysql:host='.Config::get('mysql/host').
										';dbname='.Config::get('mysql/db'),
										Config::get('mysql/username'),
										Config::get('mysql/password'));
			}else if ($remote_server){
				$this->_pdo = new PDO('mysql:host='.Config::get('mysql/remote_host').
									';dbname='.Config::get('mysql/remote_db'),
									Config::get('mysql/remote_username'),
									Config::get('mysql/remote_password'));	
				//print_r($this->_pdo);
			}
		}catch(PDOException $e){
			die($e->getMessage());
		}

	}

	public static function getInstance($remoteServer = false){
		if (!isset(self::$_instance)){
			self::$_instance = new DB($remoteServer);
		}else if(isset($remoteServer)){
			self::$_instance = new DB($remoteServer);
		}
		return self::$_instance;
	}

	public function query ($sql, $params = array())
	{
		$this->_error = false;
		//echo $sql;
		if ($this->_query = $this->_pdo->prepare($sql)){
			$x = 1;

			if (count($params)){
				foreach ($params as $param){
					$this->_query->bindValue($x, $param);
					$x++;
				}
			}

			
			if ($this->_query->execute()){
				$this->_results = $this->_query->fetchAll(PDO::FETCH_ASSOC);
				$this->_count = $this->_query->rowCount();

			}else{
				$this->_error = true;
			}
		}
		return $this;
	}

	public function action($action, $table, $where = array()){
		if (count($where) == 3){
			$operators = array('=', '<', '>', '!=', '<=', '>=');

			$field = $where[0];
			$operator = $where[1];
			$value = $where[2];

			if (in_array($operator, $operators)){
				echo $sql = "{$action} FROM {$table} WHERE {$field} {$operator} ?";

				if (!$this->query($sql, array($value))->error()){
					return $this;
				}
			}
		}
		return false;
	}

	public function get($table, $where){
		return $this->action("SELECT *", $table, $where);
	}

	public function insert($table, $fields = array()){
		if (count($fields)){
			$keys = array_keys($fields);
			$values = '';
			$x = 1;

			foreach($fields as $field){
				$values .= '?';
				if ($x < count($fields)){
					$values .= ',';
				}
				$x++;
			}

			$sql = "INSERT INTO {$table} (`". implode("`, `", $keys) ."`) VALUES ({$values})";

			if (!$this->query($sql, $fields)->error()){
				return $this;
			}
		}
		return false;
	}

	public function update($table, $where, $fields=array()){
		$set = '';
		$x = 1;

		foreach($fields as $name => $value){
			$set .= "{$name} = ?";
			if ($x < count($fields)){
				$set .= ', ';
			}
			$x++;
		}

		if (count($where) == 3){
			$operators = array('=', '<', '>', '!=', '<=', '>=');

			$field = $where[0];
			$operator = $where[1];
			$value = $where[2];

			if (in_array($operator, $operators)){
				$sql = "UPDATE {$table} SET {$set} WHERE {$field} {$operator} ?";

				array_push($fields, $value);

				if (!$this->query($sql, $fields)->error()){
					return true;
				}

			}
		}

		return false;
	}

	public function tables(){
		return $this->_pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
	}

	public function create_table($table_name){
		return $this->_pdo->query("CREATE TABLE IF NOT EXISTS {$table_name}_copy AS SELECT * FROM $table_name")->execute();
	}

	public function update_remote_table($table_name){
		$city = file_get_contents("../city.txt");
		return $this->_pdo->query("REPLACE INTO {$table_name} SELECT * FROM $table_name");
		fclose("../city.txt");
	}

	public function start(){
		$this->_pdo->beginTransaction();
	}

	public function rollback(){
		$this->_pdo->rollBack();
	}

	public function error(){
		return $this->_error;
	}

	public function results(){
		return $this->_results;
	}

	public function first(){
		return $this->results()[0];
	}

	public function count(){
		return $this->_count;
	}

}